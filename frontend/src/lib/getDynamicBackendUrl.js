// frontend/src/lib/getDynamicBackendUrl.js
export function getDynamicBackendUrl() {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol; // 'http:' or 'https:'
  const port = import.meta.env.VITE_BACKEND_PORT || "5001";

  // Localhost dev
  if (hostname === "localhost") return `http://localhost:${port}`;

  // LAN IP (phone hotspot / PC hotspot)
  if (/^10\.|^192\.168\./.test(hostname))
    return `${protocol}//${hostname}:${port}`;

  // Cloud Workstations
  if (hostname.includes("cloudworkstations.dev"))
    return `${protocol}//${hostname}:${port}`;

  // idx.google / vercel / other production host
  // Assume backend is at same host + port 5001 OR use env var
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;

  // Default fallback: same host, port 5001
  return `${protocol}//${hostname}:${port}`;
}
