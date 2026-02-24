import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { documentId } = await req.json();
    if (!documentId) throw new Error('documentId is required');

    // Get document record
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !doc) throw new Error(`Document not found: ${docError?.message}`);

    // Update status to processing
    await supabase.from('documents').update({ status: 'processing' }).eq('id', documentId);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('documents')
      .download(doc.file_path);

    if (downloadError || !fileData) throw new Error(`Download failed: ${downloadError?.message}`);

    // Convert to text - for PDFs we extract what we can
    let textContent = '';
    if (doc.file_type === 'csv') {
      textContent = await fileData.text();
    } else {
      // For PDFs, convert to base64 and use AI to extract content
      const arrayBuffer = await fileData.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      // Use AI to analyze the PDF content
      const aiResponse = await fetch(AI_GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this document thoroughly. Extract ALL data including:
- Tables and their contents
- Key metrics and measurements
- Location/ward/zone information
- Drainage network details
- Flood risk indicators
- Infrastructure details
Return a structured JSON with keys: summary, tables (array), key_metrics (object), locations (array), flood_risks (array), infrastructure (array). Be comprehensive.`
                },
                {
                  type: 'image_url',
                  image_url: { url: `data:application/pdf;base64,${base64}` }
                }
              ]
            }
          ],
          max_tokens: 4096,
        }),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        throw new Error(`AI Gateway error [${aiResponse.status}]: ${errText}`);
      }

      const aiData = await aiResponse.json();
      textContent = aiData.choices?.[0]?.message?.content || 'No content extracted';
    }

    // For CSV files, also run AI analysis
    let parsedContent: Record<string, unknown>;
    if (doc.file_type === 'csv') {
      const truncated = textContent.substring(0, 8000);
      const aiResponse = await fetch(AI_GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            {
              role: 'user',
              content: `Analyze this CSV data for flood risk monitoring. Extract key insights, patterns, and anomalies.\n\nData:\n${truncated}\n\nReturn structured JSON with: summary, columns, row_count_estimate, key_insights (array), flood_risk_indicators (array), anomalies (array).`
            }
          ],
          max_tokens: 4096,
        }),
      });

      if (!aiResponse.ok) throw new Error(`AI CSV analysis failed: ${aiResponse.status}`);
      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || '{}';
      try {
        parsedContent = JSON.parse(content.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
      } catch {
        parsedContent = { raw_analysis: content };
      }
    } else {
      try {
        parsedContent = JSON.parse(textContent.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
      } catch {
        parsedContent = { raw_analysis: textContent };
      }
    }

    // Save parsed content
    await supabase
      .from('documents')
      .update({
        status: 'parsed',
        parsed_content: parsedContent,
      })
      .eq('id', documentId);

    return new Response(JSON.stringify({ success: true, parsed_content: parsedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Parse error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
