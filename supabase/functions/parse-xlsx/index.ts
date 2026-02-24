import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "floodAI";
const REGION = "ap-south-1";
const HOST = "ghyplaiaisscvadyugyy.supabase.co";
const SERVICE = "s3";

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(key: ArrayBuffer, msg: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg));
}

async function hash(msg: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg)));
}

async function signingKey(secret: string, date: string, region: string, service: string) {
  let k = await hmac(new TextEncoder().encode("AWS4" + secret), date);
  k = await hmac(k, region);
  k = await hmac(k, service);
  k = await hmac(k, "aws4_request");
  return k;
}

async function signedFetch(method: string, urlStr: string, accessKey: string, secretKey: string) {
  const url = new URL(urlStr);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);
  const payloadHash = await hash("");

  const headers: Record<string, string> = {
    host: url.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  const signedHeaderKeys = Object.keys(headers).sort();
  const signedHeadersStr = signedHeaderKeys.join(";");
  const canonicalHeaders = signedHeaderKeys.map((k) => `${k}:${headers[k]}\n`).join("");
  const queryString = url.search ? url.search.substring(1) : "";
  const sortedQS = queryString.split("&").filter(Boolean).sort().join("&");

  const canonicalRequest = [method, url.pathname, sortedQS, canonicalHeaders, signedHeadersStr, payloadHash].join("\n");
  const credScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credScope, await hash(canonicalRequest)].join("\n");

  const sk = await signingKey(secretKey, dateStamp, REGION, SERVICE);
  const sig = toHex(await hmac(sk, stringToSign));
  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credScope}, SignedHeaders=${signedHeadersStr}, Signature=${sig}`;

  return fetch(urlStr, {
    method,
    headers: { ...headers, Authorization: authHeader },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessKey = Deno.env.get("EXTERNAL_S3_ACCESS_KEY");
    const secretKey = Deno.env.get("EXTERNAL_S3_SECRET_KEY");
    if (!accessKey || !secretKey) throw new Error("S3 credentials not configured");

    const { fileKey, sheetName, maxRows = 500 } = await req.json();
    if (!fileKey) throw new Error("fileKey is required");

    const baseUrl = `https://${HOST}/storage/v1/s3`;
    const fileUrl = `${baseUrl}/${BUCKET}/${encodeURIComponent(fileKey).replace(/%2F/g, "/")}`;

    console.log(`Fetching file: ${fileKey}`);
    const res = await signedFetch("GET", fileUrl, accessKey, secretKey);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`S3 get failed [${res.status}]: ${errText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    console.log(`File size: ${data.length} bytes`);

    const workbook = XLSX.read(data, { type: "array" });
    const sheetNames = workbook.SheetNames;
    console.log(`Sheets found: ${sheetNames.join(", ")}`);

    // If no specific sheet requested, return sheet names + preview of each
    if (!sheetName) {
      const sheetsPreview: Record<string, { headers: string[]; rowCount: number; sampleRows: any[] }> = {};
      for (const name of sheetNames) {
        const sheet = workbook.Sheets[name];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        const headers = json.length > 0 ? Object.keys(json[0] as object) : [];
        sheetsPreview[name] = {
          headers,
          rowCount: json.length,
          sampleRows: json.slice(0, 5),
        };
      }
      return new Response(JSON.stringify({ fileKey, sheetNames, sheets: sheetsPreview }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return specific sheet data
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found. Available: ${sheetNames.join(", ")}`);

    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const headers = json.length > 0 ? Object.keys(json[0] as object) : [];
    const rows = json.slice(0, maxRows);

    return new Response(
      JSON.stringify({
        fileKey,
        sheetName,
        headers,
        totalRows: json.length,
        returnedRows: rows.length,
        data: rows,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("XLSX parse error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
