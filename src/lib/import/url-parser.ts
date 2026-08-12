export type ParsedUrl = { url: string; kind: "social_profile" | "content" | "asset" | "website"; platform: string; assetType?: string };

const URL_PATTERN = /https?:\/\/[^\s<>"']+/gi;
const ASSET_HOSTS: Record<string, string> = {
  "drive.google.com": "drive", "dropbox.com": "dropbox", "www.dropbox.com": "dropbox",
  "lightroom.adobe.com": "lightroom", "sharepoint.com": "sharepoint",
};

export function parseUrls(value: unknown): ParsedUrl[] {
  const matches = String(value ?? "").match(URL_PATTERN) ?? [];
  return [...new Set(matches.map((url) => url.replace(/[),.;]+$/, "")))].flatMap<ParsedUrl>((raw) => {
    try {
      const parsed = new URL(raw);
      const host = parsed.hostname.toLowerCase();
      const asset = ASSET_HOSTS[host] ?? (host.endsWith(".sharepoint.com") ? "sharepoint" : undefined);
      if (asset) return [{ url: raw, kind: "asset" as const, platform: "other", assetType: asset }];
      if (host.includes("youtube.com") || host === "youtu.be") {
        const isContent = host === "youtu.be" || parsed.pathname.startsWith("/watch") || parsed.pathname.startsWith("/shorts/");
        return [{ url: raw, kind: isContent ? "content" as const : "social_profile" as const, platform: "youtube" }];
      }
      if (host.includes("tiktok.com")) return [{ url: raw, kind: parsed.pathname.includes("/video/") ? "content" as const : "social_profile" as const, platform: "tiktok" }];
      if (host.includes("instagram.com")) return [{ url: raw, kind: /\/(p|reel|reels)\//.test(parsed.pathname) ? "content" as const : "social_profile" as const, platform: "instagram" }];
      if (host.includes("facebook.com")) return [{ url: raw, kind: "social_profile" as const, platform: "facebook" }];
      return [{ url: raw, kind: "website" as const, platform: "website" }];
    } catch { return []; }
  });
}

export function normalizeProfileUrl(value: string) {
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  return `${url.hostname.replace(/^www\./, "").toLowerCase()}${url.pathname.replace(/\/$/, "").toLowerCase()}`;
}
