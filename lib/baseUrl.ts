export function getBaseUrl(req: Request) {
  const host = req.headers.get("host") ?? "localhost:2888";
  const proto = req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
