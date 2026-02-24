import { useState, useCallback } from "react";
import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import { Database, Upload, FileSpreadsheet, Globe, FileText, Loader2, Eye, RefreshCw, ExternalLink, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

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
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);

  // Fetch files from external S3 bucket via edge function
  const { data: bucketFiles = [], isLoading: loadingBucket, error: bucketError, refetch: refetchBucket } = useQuery({
    queryKey: ['floodai-s3-files'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('s3-bridge', {
        body: { action: 'list' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.files || [];
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
      const { data, error } = await supabase.functions.invoke('parse-document', { body: { documentId } });
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
          .select().single();
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

  const viewPdfFromS3 = async (fileKey: string) => {
    // Open via edge function proxy
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const url = `https://${projectId}.supabase.co/functions/v1/s3-bridge`;
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` },
        body: JSON.stringify({ action: 'get-url', prefix: fileKey }),
      });
      if (!res.ok) throw new Error('Failed to fetch PDF');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      setViewingPdf(blobUrl);
    } catch (err) {
      console.error('PDF view error:', err);
    }
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') return <FileSpreadsheet size={16} />;
    if (!ext || name.endsWith('/')) return <FolderOpen size={16} />;
    return <FileText size={16} />;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const getFileName = (key: string) => {
    const parts = key.split('/');
    return parts[parts.length - 1] || key;
  };

  const getFolder = (key: string) => {
    const parts = key.split('/');
    return parts.length > 1 ? parts.slice(0, -1).join('/') : '';
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="glass-panel p-4">
            <h3 className="text-sm font-semibold text-foreground tracking-wide mb-2" style={monoFont}>DATA SOURCES</h3>
            <p className="text-xs text-muted-foreground">Connected via S3 API · Reading from <span className="text-primary font-semibold">floodAI</span> bucket</p>
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
                <span className="text-xs">Loading files from floodAI bucket via S3...</span>
              </div>
            )}
            {bucketError && (
              <div className="glass-panel p-4 text-xs text-destructive">
                Error: {(bucketError as Error).message}
              </div>
            )}
            {!loadingBucket && bucketFiles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {bucketFiles.map((file: any, idx: number) => (
                  <div key={`${file.key}-${idx}`} className="glass-panel p-3 flex items-center gap-3 hover:border-primary/30 transition-colors group">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      {getFileIcon(file.key)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate" title={file.key}>{getFileName(file.key)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {getFolder(file.key) && <span className="text-primary/70">{getFolder(file.key)}/</span>}
                        {' '}{formatSize(file.size)}
                      </p>
                    </div>
                    {file.key.toLowerCase().endsWith('.pdf') && (
                      <button
                        onClick={() => viewPdfFromS3(file.key)}
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
                      <p className="text-[10px] text-muted-foreground">{doc.file_type.toUpperCase()} · {formatSize(doc.file_size)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.status === 'processing' && <Loader2 size={14} className="animate-spin text-warning" />}
                      {doc.status === 'parsed' && (
                        <button onClick={() => setViewDoc(doc)} className="p-1 rounded hover:bg-primary/10 text-primary"><Eye size={14} /></button>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusStyle[doc.status] || ''}`} style={monoFont}>{doc.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload button */}
          <label className="glass-panel p-4 w-full flex items-center justify-center gap-2 text-primary border-dashed border-2 border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span className="text-sm font-medium">{uploading ? 'Uploading & Parsing...' : 'Upload Documents (PDF, CSV)'}</span>
            <input type="file" accept=".pdf,.csv" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </main>
      </div>

      {/* View parsed content */}
      <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
        <DialogContent className="max-w-2xl bg-background border-border">
          <DialogHeader><DialogTitle className="text-sm" style={monoFont}>{viewDoc?.file_name} — AI Analysis</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap p-4 bg-muted/30 rounded-lg">
              {viewDoc?.parsed_content ? JSON.stringify(viewDoc.parsed_content, null, 2) : 'No parsed content'}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer */}
      <Dialog open={!!viewingPdf} onOpenChange={() => { if (viewingPdf) URL.revokeObjectURL(viewingPdf); setViewingPdf(null); }}>
        <DialogContent className="max-w-4xl h-[80vh] bg-background border-border">
          <DialogHeader><DialogTitle className="text-sm" style={monoFont}>PDF Viewer</DialogTitle></DialogHeader>
          {viewingPdf && <iframe src={viewingPdf} className="w-full flex-1 rounded-lg border border-border" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataSourcesPage;
