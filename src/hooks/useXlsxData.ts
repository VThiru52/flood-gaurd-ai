import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface XlsxSheetPreview {
  headers: string[];
  rowCount: number;
  sampleRows: any[];
}

interface XlsxOverview {
  fileKey: string;
  sheetNames: string[];
  sheets: Record<string, XlsxSheetPreview>;
}

interface XlsxSheetData {
  fileKey: string;
  sheetName: string;
  headers: string[];
  totalRows: number;
  returnedRows: number;
  data: any[];
}

async function fetchXlsxSheet(fileKey: string, sheetName?: string, maxRows = 500) {
  const { data, error } = await supabase.functions.invoke("parse-xlsx", {
    body: { fileKey, sheetName, maxRows },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useXlsxOverview(fileKey: string) {
  return useQuery<XlsxOverview>({
    queryKey: ["xlsx-overview", fileKey],
    queryFn: () => fetchXlsxSheet(fileKey),
    staleTime: 10 * 60 * 1000, // 10 min cache
  });
}

export function useXlsxSheet(fileKey: string, sheetName: string, maxRows = 500, enabled = true) {
  return useQuery<XlsxSheetData>({
    queryKey: ["xlsx-sheet", fileKey, sheetName, maxRows],
    queryFn: () => fetchXlsxSheet(fileKey, sheetName, maxRows),
    staleTime: 10 * 60 * 1000,
    enabled,
  });
}

// --- Typed data extractors ---

export interface RainfallRecord {
  year: string;
  month: string;
  day: string;
  dailyRainfall: number;
  intensity5: number;
  intensity10: number;
  intensity15: number;
  intensity30: number;
  intensity45: number;
  intensity60: number;
  intensity90: number;
  intensity120: number;
  intensity180: number;
}

export function parseRainfallDRF(raw: any[]): RainfallRecord[] {
  // Skip header row (first item has Year === "")
  return raw
    .filter((r) => r.Year && !isNaN(Number(r.Year)))
    .map((r) => ({
      year: String(r.Year),
      month: String(r.Month),
      day: String(r.Day),
      dailyRainfall: Number(r["Daily Rainfall in mm"]) || 0,
      intensity5: Number(r["Intensity in mm/hr for Duration in min"]) || 0,
      intensity10: Number(r.__EMPTY_9) || 0,
      intensity15: Number(r.__EMPTY_10) || 0,
      intensity30: Number(r.__EMPTY_11) || 0,
      intensity45: Number(r.__EMPTY_12) || 0,
      intensity60: Number(r.__EMPTY_13) || 0,
      intensity90: Number(r.__EMPTY_15) || 0,
      intensity120: Number(r.__EMPTY_16) || 0,
      intensity180: Number(r.__EMPTY_17) || 0,
    }));
}

export interface PopulationRecord {
  year: number;
  population: number;
  increase: number;
  percentIncrease: number;
}

export function parsePopulationProjections(raw: any[]): PopulationRecord[] {
  const key = "POPULATION PROJECTIONS FOR KADAPA MUNICIPAL CORPORATION, Y.S.R. DIST., ANDHRA PRADESH STATE";
  return raw
    .filter((r) => typeof r[key] === "number" && r.__EMPTY && !isNaN(Number(r.__EMPTY)))
    .map((r) => ({
      year: Number(r.__EMPTY),
      population: Number(r.__EMPTY_1) || 0,
      increase: Number(r.__EMPTY_2) || 0,
      percentIncrease: Number(r.__EMPTY_3) || 0,
    }));
}

export interface SubDivisionRecord {
  division: string;
  subDivision: string;
  households: number;
  population: number;
  location: string;
  area: number;
  density: number;
  pop2025: number;
  pop2040: number;
  pop2055: number;
}

export function parseSubDivisions(raw: any[]): SubDivisionRecord[] {
  const key = "Population Projection Sub-Division Wise in Kadapa Municipal Corporation";
  let lastDivision = "";
  return raw
    .filter((r) => r.__EMPTY && String(r.__EMPTY).includes("Div"))
    .map((r) => {
      if (r[key] && String(r[key]).startsWith("Division")) lastDivision = String(r[key]);
      return {
        division: r[key] || lastDivision,
        subDivision: String(r.__EMPTY || ""),
        households: Number(r.__EMPTY_1) || 0,
        population: Number(r.__EMPTY_2) || 0,
        location: String(r.__EMPTY_3 || ""),
        area: Number(r.__EMPTY_4) || 0,
        density: Number(r.__EMPTY_6) || 0,
        pop2025: Number(r.__EMPTY_10) || 0,
        pop2040: Number(r.__EMPTY_11) || 0,
        pop2055: Number(r.__EMPTY_12) || 0,
      };
    });
}
