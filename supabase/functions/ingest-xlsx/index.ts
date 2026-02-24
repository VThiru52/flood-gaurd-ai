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

// Parse one specific sheet from a file
async function fetchSheet(fileKey: string, sheetName: string, accessKey: string, secretKey: string) {
  const baseUrl = `https://${HOST}/storage/v1/s3`;
  const fileUrl = `${baseUrl}/${BUCKET}/${encodeURIComponent(fileKey).replace(/%2F/g, "/")}`;
  const res = await signedFetch("GET", fileUrl, accessKey, secretKey);
  if (!res.ok) throw new Error(`S3 failed: ${res.status}`);
  const ab = await res.arrayBuffer();
  // Parse ONLY the target sheet - no row limit
  const wb = XLSX.read(new Uint8Array(ab), { type: "array", sheets: sheetName });
  const sheet = wb.Sheets[sheetName];
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

async function batchInsert(supabase: any, table: string, rows: any[], chunkSize = 50) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) { console.error(`Insert error ${table}:`, error); throw error; }
    inserted += chunk.length;
  }
  return inserted;
}

async function logIngestion(supabase: any, fileKey: string, sheetName: string, targetTable: string, rowCount: number) {
  await supabase.from("data_ingestion_log").upsert({
    file_key: fileKey, sheet_name: sheetName,
    target_table: targetTable, rows_ingested: rowCount, status: "complete",
  }, { onConflict: "file_key,sheet_name" });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const accessKey = Deno.env.get("EXTERNAL_S3_ACCESS_KEY")!;
    const secretKey = Deno.env.get("EXTERNAL_S3_SECRET_KEY")!;
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Accept: { sheet: "rainfall" | "population" | "subdivision" | "idf_6m" | "idf_1y" | "idf_2y" | "idf_5y" | "ward" | "all", force: boolean }
    const { sheet = "all", force = false } = await req.json().catch(() => ({ sheet: "all", force: false }));
    const results: Record<string, string> = {};

    async function shouldIngest(fileKey: string, sheetName: string): Promise<boolean> {
      if (force) return true;
      const { data } = await supabase.from("data_ingestion_log").select("id").eq("file_key", fileKey).eq("sheet_name", sheetName).single();
      return !data;
    }

    // 1. DRF-Ana → historical_rainfall (ALL rows)
    if (sheet === "all" || sheet === "rainfall") {
      const fk = "KadapaRainfall5.csv", sn = "DRF-Ana";
      if (await shouldIngest(fk, sn)) {
        console.log("Ingesting DRF-Ana (all rows)...");
        if (force) await supabase.from("historical_rainfall").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        const raw = await fetchSheet(fk, sn, accessKey, secretKey);
        const rows = raw
          .filter((r: any) => r.Year && !isNaN(Number(r.Year)))
          .map((r: any) => ({
            year: Number(r.Year), month: Number(r.Month), day: Number(r.Day),
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
        const n = await batchInsert(supabase, "historical_rainfall", rows);
        await logIngestion(supabase, fk, sn, "historical_rainfall", n);
        results.rainfall = `ingested_${n}_rows`;
      } else { results.rainfall = "already_ingested"; }
    }

    // 2. Population projections → population_data
    if (sheet === "all" || sheet === "population") {
      const fk = "KadapaTownPopulationProjections.csv", sn = "population projections";
      if (await shouldIngest(fk, sn)) {
        console.log("Ingesting population projections...");
        if (force) await supabase.from("population_data").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        const raw = await fetchSheet(fk, sn, accessKey, secretKey);
        const key = "POPULATION PROJECTIONS FOR KADAPA MUNICIPAL CORPORATION, Y.S.R. DIST., ANDHRA PRADESH STATE";
        const rows = raw
          .filter((r: any) => typeof r[key] === "number" && r.__EMPTY && !isNaN(Number(r.__EMPTY)))
          .map((r: any) => ({
            year: Number(r.__EMPTY), population: Number(r.__EMPTY_1) || 0,
            increase: Number(r.__EMPTY_2) || 0, percent_increase: Number(r.__EMPTY_3) || 0, method: "census",
          }));
        if (rows.length > 0) {
          const n = await batchInsert(supabase, "population_data", rows);
          await logIngestion(supabase, fk, sn, "population_data", n);
          results.population = `ingested_${n}_rows`;
        }
      } else { results.population = "already_ingested"; }
    }

    // 3. Sub Division wise → subdivision_population
    if (sheet === "all" || sheet === "subdivision") {
      const fk = "KadapaTownPopulationProjections.csv", sn = "Sub Division wise";
      if (await shouldIngest(fk, sn)) {
        console.log("Ingesting sub-division data...");
        if (force) await supabase.from("subdivision_population").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        const raw = await fetchSheet(fk, sn, accessKey, secretKey);
        const key = "Population Projection Sub-Division Wise in Kadapa Municipal Corporation";
        let lastDivision = "";
        const rows = raw
          .filter((r: any) => r.__EMPTY && String(r.__EMPTY).includes("Div"))
          .map((r: any) => {
            if (r[key] && String(r[key]).startsWith("Division")) lastDivision = String(r[key]);
            return {
              division: r[key] || lastDivision, sub_division: String(r.__EMPTY || ""),
              households: Number(r.__EMPTY_1) || 0, population: Number(r.__EMPTY_2) || 0,
              location: String(r.__EMPTY_3 || "").substring(0, 500),
              area_sqkm: Number(r.__EMPTY_4) || 0, density_per_sqkm: Number(r.__EMPTY_6) || 0,
              pop_2025: Number(r.__EMPTY_10) || 0, pop_2040: Number(r.__EMPTY_11) || 0, pop_2055: Number(r.__EMPTY_12) || 0,
            };
          });
        if (rows.length > 0) {
          const n = await batchInsert(supabase, "subdivision_population", rows);
          await logIngestion(supabase, fk, sn, "subdivision_population", n);
          results.subdivision = `ingested_${n}_rows`;
        }
      } else { results.subdivision = "already_ingested"; }
    }

    // 4-7. IDF Return Period sheets → storm_frequency
    const idfSheets = [
      { sheet: "idf_6m", sheetName: "Once in 6months", returnPeriod: "6months" },
      { sheet: "idf_1y", sheetName: "Once in a Year", returnPeriod: "1year" },
      { sheet: "idf_2y", sheetName: "Once in 2Years", returnPeriod: "2years" },
      { sheet: "idf_5y", sheetName: "Once in 5Years ", returnPeriod: "5years" },
    ];
    for (const idf of idfSheets) {
      if (sheet === "all" || sheet === idf.sheet) {
        const fk = "KadapaRainfall5.csv";
        if (await shouldIngest(fk, idf.sheetName)) {
          console.log(`Ingesting IDF: ${idf.sheetName}...`);
          if (force) await supabase.from("storm_frequency").delete().eq("return_period", idf.returnPeriod);
          const raw = await fetchSheet(fk, idf.sheetName, accessKey, secretKey);
          const key = "Analysis of Frequecny of Storms";
          const rows = raw
            .filter((r: any) => typeof r[key] === "number" && r[key] > 0)
            .map((r: any) => ({
              return_period: idf.returnPeriod,
              intensity_threshold: Number(r[key]),
              duration_5min: Number(r.__EMPTY_1) || 0,
              duration_10min: Number(r.__EMPTY_2) || 0,
              duration_15min: Number(r.__EMPTY_3) || 0,
              duration_20min: Number(r.__EMPTY_4) || 0,
              duration_25min: Number(r.__EMPTY_5) || 0,
              duration_30min: Number(r.__EMPTY_6) || 0,
              duration_40min: Number(r.__EMPTY_7) || 0,
              duration_50min: Number(r.__EMPTY_8) || 0,
              duration_60min: Number(r.__EMPTY_9) || 0,
              duration_75min: Number(r.__EMPTY_10) || 0,
            }));
          if (rows.length > 0) {
            const n = await batchInsert(supabase, "storm_frequency", rows);
            await logIngestion(supabase, fk, idf.sheetName, "storm_frequency", n);
            results[idf.sheet] = `ingested_${n}_rows`;
          }
        } else { results[idf.sheet] = "already_ingested"; }
      }
    }

    // 8. Ward wise population census → ward_projections
    if (sheet === "all" || sheet === "ward") {
      const fk = "KadapaTownPopulationProjections.csv", sn = "ward wise population census";
      if (await shouldIngest(fk, sn)) {
        console.log("Ingesting ward projections...");
        if (force) await supabase.from("ward_projections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        const raw = await fetchSheet(fk, sn, accessKey, secretKey);
        const rows = raw
          .filter((r: any) => typeof r["growth rate for "] === "number")
          .map((r: any) => ({
            growth_rate: Number(r["growth rate for "]) || 0,
            base_population: Number(r.__EMPTY_8) || 0,
            projected_2025: Number(r["2025"]) || 0,
            projected_2040: Number(r["2040"]) || 0,
            projected_2055: Number(r["2055"]) || 0,
          }));
        if (rows.length > 0) {
          const n = await batchInsert(supabase, "ward_projections", rows);
          await logIngestion(supabase, fk, sn, "ward_projections", n);
          results.ward = `ingested_${n}_rows`;
        }
      } else { results.ward = "already_ingested"; }
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
