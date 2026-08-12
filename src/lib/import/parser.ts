import * as XLSX from "xlsx";
import { canonicalizeName } from "@/lib/utils";
import { parseUrls } from "./url-parser";
export { findPartnerMatch } from "./dedupe";

export type ImportRowAnalysis = { row: number; source: Record<string, unknown>; name?: string; canonicalName?: string; urls: ReturnType<typeof parseUrls>; warnings: string[]; skipped: boolean };

export function parseImportFile(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  return workbook.SheetNames.map((name) => ({ name, rows: XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[name], { defval: "" }) }));
}

export function analyzeRows(rows: Record<string, unknown>[]): ImportRowAnalysis[] {
  return rows.map((source, index) => {
    const name = String(source["网红"] ?? source["Partner"] ?? source["Name"] ?? "").trim();
    const joined = Object.values(source).join("\n");
    const urls = parseUrls(joined);
    const warnings: string[] = [];
    const skipped = !name || /^\d+月\d+日$/.test(name) || name.includes("合作事项清单");
    if (!skipped && !String(source["合作邮箱"] ?? "").trim()) warnings.push("缺少邮箱");
    if (!skipped && urls.length === 0) warnings.push("未识别到链接");
    return { row: index + 2, source, name: name || undefined, canonicalName: name ? canonicalizeName(name) : undefined, urls, warnings, skipped };
  });
}
