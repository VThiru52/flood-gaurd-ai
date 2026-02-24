import { useState, useCallback } from "react";
import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import { Database, Upload, FileSpreadsheet, Globe, FileText, Loader2, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const staticSources = [
  { name: "IMD Rainfall Data", type: "API", status: "connected", icon: <Globe size={16} />, lastSync: "2 min ago" },
  { name: "Ward Sensor Grid", type: "IoT", status: "connected", icon: <Database size={16} />, lastSync: "Live" },
];

const statusStyle: Record<string, string> = {
  connected: "bg-success/20 text-success",
  uploaded: "bg-primary/20 text-primary",
  pending: "bg-warning/20 text-warning",
  processing: "bg-warning/20 text-warning",
  parsed: "bg-success/20 text-success",
  error: "bg-destructive/20 text-destructive",
};

const DataSourcesPage = () => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [viewDoc, setViewDoc] = useState<any>(null);

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const parseMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { data, error } = await supabase.functions.invoke('parse-document', {
        body: { documentId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const fileType = ['csv'].includes(ext) ? 'csv' : 'pdf';
        const filePath = `uploads/${Date.now()}_${file.name}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
        if (uploadError) throw uploadError;

        // Create document record
        const { data: doc, error: insertError } = await supabase
          .from('documents')
          .insert({ file_name: file.name, file_path: filePath, file_type: fileType, file_size: file.size })
          .select()
          .single();
        if (insertError) throw insertError;

        // Auto-parse
        parseMutation.mutate(doc.id);
      }
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [queryClient, parseMutation]);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="glass-panel p-4">
            <h3 className="text-sm font-semibold text-foreground tracking-wide mb-2" style={monoFont}>DATA SOURCES</h3>
            <p className="text-xs text-muted-foreground">Upload PDFs, CSVs — AI will automatically parse and extract flood-relevant data.</p>
          </div>

          {/* Static sources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {staticSources.map((src) => (
              <div key={src.name} className="glass-panel p-4 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">{src.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{src.name}</p>
                  <p className="text-[10px] text-muted-foreground">Type: {src.type} · Last sync: {src.lastSync}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusStyle[src.status]}`} style={monoFont}>
                  {src.status}
                </span>
              </div>
            ))}
          </div>

          {/* Uploaded documents */}
          {documents.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" style={monoFont}>Uploaded Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="glass-panel p-4 flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {doc.file_type === 'csv' ? <FileSpreadsheet size={16} /> : <FileText size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {doc.file_type.toUpperCase()} · {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)}KB` : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.status === 'processing' && <Loader2 size={14} className="animate-spin text-warning" />}
                      {doc.status === 'parsed' && (
                        <button onClick={() => setViewDoc(doc)} className="p-1 rounded hover:bg-primary/10 text-primary">
                          <Eye size={14} />
                        </button>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusStyle[doc.status] || ''}`} style={monoFont}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload button */}
          <label className="glass-panel p-4 w-full flex items-center justify-center gap-2 text-primary border-dashed border-2 border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span className="text-sm font-medium">
              {uploading ? 'Uploading & Parsing...' : 'Upload Documents (PDF, CSV)'}
            </span>
            <input type="file" accept=".pdf,.csv" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </main>
      </div>

      {/* View parsed content dialog */}
      <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
        <DialogContent className="max-w-2xl bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-sm" style={monoFont}>{viewDoc?.file_name} — AI Analysis</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap p-4 bg-muted/30 rounded-lg">
              {viewDoc?.parsed_content ? JSON.stringify(viewDoc.parsed_content, null, 2) : 'No parsed content'}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataSourcesPage;
