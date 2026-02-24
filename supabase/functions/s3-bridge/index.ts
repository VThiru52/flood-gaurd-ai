import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BUCKET = 'floodAI';
const REGION = 'ap-south-1';
const HOST = 'ghyplaiaisscvadyugyy.supabase.co';
const SERVICE = 's3';

// --- AWS SigV4 helpers ---
function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmac(key: ArrayBuffer, msg: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', k, new TextEncoder().encode(msg));
}

async function hash(msg: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg)));
}

async function signingKey(secret: string, date: string, region: string, service: string) {
  let k = await hmac(new TextEncoder().encode('AWS4' + secret), date);
  k = await hmac(k, region);
  k = await hmac(k, service);
  k = await hmac(k, 'aws4_request');
  return k;
}

async function signedFetch(method: string, urlStr: string, accessKey: string, secretKey: string, body?: string) {
  const url = new URL(urlStr);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  const payloadHash = await hash(body || '');

  const headers: Record<string, string> = {
    'host': url.host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  };
  if (body) headers['content-type'] = 'application/xml';

  const signedHeaderKeys = Object.keys(headers).sort();
  const signedHeadersStr = signedHeaderKeys.join(';');
  const canonicalHeaders = signedHeaderKeys.map(k => `${k}:${headers[k]}\n`).join('');

  const queryString = url.search ? url.search.substring(1) : '';
  // Sort query params
  const sortedQS = queryString.split('&').filter(Boolean).sort().join('&');

  const canonicalRequest = [method, url.pathname, sortedQS, canonicalHeaders, signedHeadersStr, payloadHash].join('\n');
  const credScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credScope, await hash(canonicalRequest)].join('\n');

  const sk = await signingKey(secretKey, dateStamp, REGION, SERVICE);
  const sig = toHex(await hmac(sk, stringToSign));
  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credScope}, SignedHeaders=${signedHeadersStr}, Signature=${sig}`;

  return fetch(urlStr, {
    method,
    headers: { ...headers, 'Authorization': authHeader },
    body: body || undefined,
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessKey = Deno.env.get('EXTERNAL_S3_ACCESS_KEY');
    const secretKey = Deno.env.get('EXTERNAL_S3_SECRET_KEY');
    if (!accessKey || !secretKey) throw new Error('S3 credentials not configured');

    const { prefix = '', action = 'list' } = await req.json().catch(() => ({}));
    const baseUrl = `https://${HOST}/storage/v1/s3`;

    if (action === 'list') {
      let allFiles: Array<{ key: string; size: number; lastModified: string }> = [];
      let continuationToken = '';
      let isTruncated = true;

      while (isTruncated) {
        let qs = `list-type=2&max-keys=1000`;
        if (prefix) qs += `&prefix=${encodeURIComponent(prefix)}`;
        if (continuationToken) qs += `&continuation-token=${encodeURIComponent(continuationToken)}`;

        const url = `${baseUrl}/${BUCKET}?${qs}`;
        const res = await signedFetch('GET', url, accessKey, secretKey);
        const text = await res.text();

        console.log(`S3 list [${res.status}]:`, text.substring(0, 300));

        if (!res.ok) throw new Error(`S3 list failed [${res.status}]: ${text}`);

        // Parse XML
        const keys = [...text.matchAll(/<Key>([^<]+)<\/Key>/g)].map(m => m[1]);
        const sizes = [...text.matchAll(/<Size>(\d+)<\/Size>/g)].map(m => parseInt(m[1]));
        const dates = [...text.matchAll(/<LastModified>([^<]+)<\/LastModified>/g)].map(m => m[1]);

        for (let i = 0; i < keys.length; i++) {
          allFiles.push({ key: keys[i], size: sizes[i] || 0, lastModified: dates[i] || '' });
        }

        isTruncated = text.includes('<IsTruncated>true</IsTruncated>');
        const tokenMatch = text.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/);
        continuationToken = tokenMatch ? tokenMatch[1] : '';
      }

      return new Response(JSON.stringify({ files: allFiles, raw_count: allFiles.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get-url') {
      const filePath = prefix;
      const url = `${baseUrl}/${BUCKET}/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`;
      const res = await signedFetch('GET', url, accessKey, secretKey);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`S3 get failed [${res.status}]: ${errText}`);
      }

      const blob = await res.blob();
      return new Response(blob, {
        headers: {
          ...corsHeaders,
          'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream',
        },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: unknown) {
    console.error('S3 bridge error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
