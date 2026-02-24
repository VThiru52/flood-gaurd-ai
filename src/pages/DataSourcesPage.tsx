import { useState, useCallback } from "react";
import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import { Database, Upload, FileSpreadsheet, Globe, FileText, Loader2, Eye, RefreshCw, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { externalSupabase } from "@/integrations/supabase/external-client";
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
  bucket: "bg-accent/20 text-accent-foreground",
};

const DataSourcesPage = () => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [viewDoc, setViewDoc] = useState<any>(null);
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);

  // Fetch files from external Supabase floodAI bucket
  const { data: bucketFiles = [], isLoading: loadingBucket, error: bucketError, refetch: refetchBucket } = useQuery({
    queryKey: ['floodai-bucket-files'],
    queryFn: async () => {
      const { data, error } = await externalSupabase.storage.from('floodAI').list('', {
        limit: 200,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      if (error) throw error;
      // Also try listing subdirectories
      const allFiles: any[] = [];
      if (data) {
        for (const item of data) {
          if (item.id) {
            // It's a file
            allFiles.push({ ...item, folder: '' });
          } else {
            // It's a folder, list its contents
            const { data: subFiles } = await externalSupabase.storage.from('floodAI').list(item.name, {
              limit: 200,
              sortBy: { column: 'created_at', order: 'desc' },
            });
            if (subFiles) {
              for (const sub of subFiles) {
                if (sub.id) {
                  allFiles.push({ ...sub, folder: item.name });
                }
              }
            }
          }
        }
      }
      return allFiles;
    },
  });

  // Fetch local documents
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
        const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: doc, error: insertError } = await supabase
          .from('documents')
          .insert({ file_name: file.name, file_path: filePath, file_type: fileType, file_size: file.size })
          .select()
          .single();
        if (insertError) throw insertError;
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

  const openPdfFromBucket = (folder: string, fileName: string) => {
    const path = folder ? `${folder}/${fileName}` : fileName;
    const { data } = externalSupabase.storage.from('floodAI').getPublicUrl(path);
    if (data?.publicUrl) {
      setViewingPdf(data.publicUrl);
    }
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') return <FileSpreadsheet size={16} />;
    return <FileText size={16} />;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="glass-panel p-4">
            <h3 className="text-sm font-semibold text-foreground tracking-wide mb-2" style={monoFont}>DATA SOURCES</h3>
            <p className="text-xs text-muted-foreground">Connected to external Supabase · Reading from <span className="text-primary font-semibold">floodAI</span> bucket</p>
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

          {/* FloodAI Bucket Files */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" style={monoFont}>
                FloodAI Bucket · {bucketFiles.length} files
              </h4>
              <button onClick={() => refetchBucket()} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>
            {loadingBucket && (
              <div className="glass-panel p-8 flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">Loading files from floodAI bucket...</span>
              </div>
            )}
            {bucketError && (
              <div className="glass-panel p-4 text-xs text-destructive">
                Error loading bucket: {(bucketError as Error).message}
              </div>
            )}
            {!loadingBucket && bucketFiles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {bucketFiles.map((file: any, idx: number) => (
                  <div key={`${file.folder}-${file.name}-${idx}`} className="glass-panel p-3 flex items-center gap-3 hover:border-primary/30 transition-colors group">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      {getFileIcon(file.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate" title={file.name}>{file.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {file.folder && <span className="text-primary/70">{file.folder}/</span>}
                        {' '}{formatSize(file.metadata?.size)}
                      </p>
                    </div>
                    {file.name.toLowerCase().endsWith('.pdf') && (
                      <button
                        onClick={() => openPdfFromBucket(file.folder, file.name)}
                        className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        title="View PDF"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!loadingBucket && bucketFiles.length === 0 && !bucketError && (
              <div className="glass-panel p-4 text-xs text-muted-foreground text-center">
                No files found in floodAI bucket
              </div>
            )}
          </div>

          {/* Local uploaded documents */}
          {documents.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" style={monoFont}>Local Uploads</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="glass-panel p-4 flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {doc.file_type === 'csv' ? <FileSpreadsheet size={16} /> : <FileText size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {doc.file_type.toUpperCase()} · {formatSize(doc.file_size)}
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

      {/* PDF Viewer dialog */}
      <Dialog open={!!viewingPdf} onOpenChange={() => setViewingPdf(null)}>
        <DialogContent className="max-w-4xl h-[80vh] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2" style={monoFont}>
              PDF Viewer
              {viewingPdf && (
                <a href={viewingPdf} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink size={14} />
                </a>
              )}
            </DialogTitle>
          </DialogHeader>
          {viewingPdf && (
            <iframe src={viewingPdf} className="w-full flex-1 rounded-lg border border-border" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataSourcesPage;
