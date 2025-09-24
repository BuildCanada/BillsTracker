const RAW_BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH || process.env.NEXT_BASE_PATH || "/bills";

const normalizedBasePath = (() => {
  let path = RAW_BASE_PATH || "";
  if (!path || path === "/") {
    return "";
  }
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  if (path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  return path;
})();

export const BASE_PATH = normalizedBasePath;

export function stripBasePath(url: string | undefined): string {
  if (!url) {
    return "";
  }
  const trimmed = url.replace(/\/$/, "");
  if (!normalizedBasePath) {
    return trimmed;
  }
  if (trimmed.endsWith(normalizedBasePath)) {
    return trimmed.slice(0, trimmed.length - normalizedBasePath.length) || "";
  }
  return trimmed;
}

function normalizeSegment(segment: string): string {
  return segment.replace(/^\/+|\/+$/g, "");
}

export function buildRelativePath(
  ...segments: Array<string | number | undefined | null>
): string {
  const parts = [normalizedBasePath, ...segments]
    .filter(
      (segment): segment is string | number =>
        segment !== undefined && segment !== null,
    )
    .map((segment) => normalizeSegment(String(segment)))
    .filter(Boolean);

  if (parts.length === 0) {
    return normalizedBasePath || "/";
  }

  return `/${parts.join("/")}`;
}

export function buildAbsoluteUrl(
  origin: string | undefined,
  ...segments: Array<string | number | undefined | null>
): string {
  const relative = buildRelativePath(...segments);
  if (!origin) {
    return relative;
  }
  const trimmedOrigin = origin.replace(/\/$/, "");
  return `${trimmedOrigin}${relative}`;
}
