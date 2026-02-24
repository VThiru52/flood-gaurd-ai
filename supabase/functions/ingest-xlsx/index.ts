import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
  k = await hmac(k, region); k = await hmac(k, service); k = await hmac(k, "aws4_request");
  return k;
}
async function signedFetch(method: string, urlStr: string, accessKey: string, secretKey: string) {
  const url = new URL(urlStr);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);
  const payloadHash = await hash("");
  const headers: Record<string, string> = { host: url.host, "x-amz-content-sha256": payloadHash, "x-amz-date": amzDate };
  const signedHeaderKeys = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaderKeys.map((k) => `${k}:${headers[k]}\n`).join("");
  const sortedQS = (url.search ? url.search.substring(1) : "").split("&").filter(Boolean).sort().join("&");
  const canonicalRequest = [method, url.pathname, sortedQS, canonicalHeaders, signedHeaderKeys.join(";"), payloadHash].join("\n");
  const credScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credScope, await hash(canonicalRequest)].join("\n");
  const sk = await signingKey(secretKey, dateStamp, REGION, SERVICE);
  const sig = toHex(await hmac(sk, stringToSign));
  return fetch(urlStr, { method, headers: { ...headers, Authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${credScope}, SignedHeaders=${signedHeaderKeys.join(";")}, Signature=${sig}` } });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const accessKey = Deno.env.get("EXTERNAL_S3_ACCESS_KEY")!;
    const secretKey = Deno.env.get("EXTERNAL_S3_SECRET_KEY")!;
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { target } = await req.json().catch(() => ({ target: "all" }));
    const results: Record<string, string> = {};

    async function fetchFile(fileKey: string, sheetName: string, maxRows: number) {
      const baseUrl = `https://${HOST}/storage/v1/s3`;
      const fileUrl = `${baseUrl}/${BUCKET}/${encodeURIComponent(fileKey).replace(/%2F/g, "/")}`;
      const res = await signedFetch("GET", fileUrl, accessKey, secretKey);
      if (!res.ok) throw new Error(`S3 failed: ${res.status}`);
      const ab = await res.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(ab), { type: "array", sheets: sheetName, sheetRows: maxRows + 5 });
      return XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "" });
    }

    // --- Ingest Historical Rainfall from DRF-Ana ---
    if (target === "all" || target === "rainfall") {
      console.log("Ingesting rainfall data...");
      // Check if already ingested
      const { data: existing } = await supabase.from("data_ingestion_log").select("id").eq("file_key", "KadapaRainfall5.csv").eq("sheet_name", "DRF-Ana").single();
      if (existing) {
        results.rainfall = "already_ingested";
      } else {
        const raw = await fetchFile("KadapaRainfall5.csv", "DRF-Ana", 200);
        const rows = raw
          .filter((r: any) => r.Year && !isNaN(Number(r.Year)))
          .slice(0, 200)
          .map((r: any) => ({
            year: Number(r.Year),
            month: Number(r.Month),
            day: Number(r.Day),
            daily_rainfall_mm: Number(r["Daily Rainfall in mm"]) || 0,
            intensity_5min: Number(r["Intensity in mm/hr for Duration in min"]) || 0,
            intensity_10min: Number(r.__EMPTY_9) || 0,
            intensity_15min: Number(r.__EMPTY_10) || 0,
            intensity_30min: Number(r.__EMPTY_11) || 0,
            intensity_45min: Number(r.__EMPTY_12) || 0,
            intensity_60min: Number(r.__EMPTY_13) || 0,
            intensity_90min: Number(r.__EMPTY_15) || 0,
            intensity_120min: Number(r.__EMPTY_16) || 0,
            intensity_180min: Number(r.__EMPTY_17) || 0,
          }));

        // Batch insert in chunks of 50
        for (let i = 0; i < rows.length; i += 50) {
          const chunk = rows.slice(i, i + 50);
          const { error } = await supabase.from("historical_rainfall").insert(chunk);
          if (error) { console.error("Rainfall insert error:", error); throw error; }
        }

        await supabase.from("data_ingestion_log").upsert({
          file_key: "KadapaRainfall5.csv", sheet_name: "DRF-Ana",
          target_table: "historical_rainfall", rows_ingested: rows.length, status: "complete",
        }, { onConflict: "file_key,sheet_name" });

        results.rainfall = `ingested_${rows.length}_rows`;
      }
    }

    // --- Ingest Population Projections ---
    if (target === "all" || target === "population") {
      console.log("Ingesting population data...");
      const { data: existing } = await supabase.from("data_ingestion_log").select("id").eq("file_key", "KadapaTownPopulationProjections.csv").eq("sheet_name", "population projections").single();
      if (existing) {
        results.population = "already_ingested";
      } else {
        const raw = await fetchFile("KadapaTownPopulationProjections.csv", "population projections", 100);
        const key = "POPULATION PROJECTIONS FOR KADAPA MUNICIPAL CORPORATION, Y.S.R. DIST., ANDHRA PRADESH STATE";
        const rows = raw
          .filter((r: any) => typeof r[key] === "number" && r.__EMPTY && !isNaN(Number(r.__EMPTY)))
          .map((r: any) => ({
            year: Number(r.__EMPTY),
            population: Number(r.__EMPTY_1) || 0,
            increase: Number(r.__EMPTY_2) || 0,
            percent_increase: Number(r.__EMPTY_3) || 0,
            method: "census",
          }));

        if (rows.length > 0) {
          const { error } = await supabase.from("population_data").insert(rows);
          if (error) throw error;
        }

        await supabase.from("data_ingestion_log").upsert({
          file_key: "KadapaTownPopulationProjections.csv", sheet_name: "population projections",
          target_table: "population_data", rows_ingested: rows.length, status: "complete",
        }, { onConflict: "file_key,sheet_name" });

        results.population = `ingested_${rows.length}_rows`;
      }
    }

    // --- Ingest Sub-Division data ---
    if (target === "all" || target === "subdivision") {
      console.log("Ingesting subdivision data...");
      const { data: existing } = await supabase.from("data_ingestion_log").select("id").eq("file_key", "KadapaTownPopulationProjections.csv").eq("sheet_name", "Sub Division wise").single();
      if (existing) {
        results.subdivision = "already_ingested";
      } else {
        const raw = await fetchFile("KadapaTownPopulationProjections.csv", "Sub Division wise", 200);
        const key = "Population Projection Sub-Division Wise in Kadapa Municipal Corporation";
        let lastDivision = "";
        const rows = raw
          .filter((r: any) => r.__EMPTY && String(r.__EMPTY).includes("Div"))
          .map((r: any) => {
            if (r[key] && String(r[key]).startsWith("Division")) lastDivision = String(r[key]);
            return {
              division: r[key] || lastDivision,
              sub_division: String(r.__EMPTY || ""),
              households: Number(r.__EMPTY_1) || 0,
              population: Number(r.__EMPTY_2) || 0,
              location: String(r.__EMPTY_3 || "").substring(0, 500),
              area_sqkm: Number(r.__EMPTY_4) || 0,
              density_per_sqkm: Number(r.__EMPTY_6) || 0,
              pop_2025: Number(r.__EMPTY_10) || 0,
              pop_2040: Number(r.__EMPTY_11) || 0,
              pop_2055: Number(r.__EMPTY_12) || 0,
            };
          });

        if (rows.length > 0) {
          const { error } = await supabase.from("subdivision_population").insert(rows);
          if (error) throw error;
        }

        await supabase.from("data_ingestion_log").upsert({
          file_key: "KadapaTownPopulationProjections.csv", sheet_name: "Sub Division wise",
          target_table: "subdivision_population", rows_ingested: rows.length, status: "complete",
        }, { onConflict: "file_key,sheet_name" });

        results.subdivision = `ingested_${rows.length}_rows`;
      }
    }

    console.log("Ingestion results:", results);
    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Ingest error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
