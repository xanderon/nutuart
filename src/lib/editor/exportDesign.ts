function triggerDownload(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  triggerDownload(dataUrl, filename);
}

export function downloadTextFile(
  contents: string,
  filename: string,
  mimeType = "application/json"
) {
  const blob = new Blob([contents], { type: mimeType });
  const href = URL.createObjectURL(blob);
  triggerDownload(href, filename);
  window.setTimeout(() => URL.revokeObjectURL(href), 1_000);
}

export function buildExportFilename(baseName: string, extension: "png" | "json") {
  const slug = baseName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "design"}-${extension === "png" ? "preview" : "state"}.${extension}`;
}
