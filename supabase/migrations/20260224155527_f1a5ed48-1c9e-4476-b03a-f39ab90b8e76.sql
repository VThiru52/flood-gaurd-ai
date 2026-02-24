
-- Table to track uploaded documents
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  file_size BIGINT,
  status TEXT NOT NULL DEFAULT 'uploaded',
  parsed_content JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Public access policies
CREATE POLICY "Allow public read" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.documents FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.documents FOR DELETE USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
