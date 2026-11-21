import { notFound } from "next/navigation";
import manifestRaw from "@/data/image-manifest.json";
import vehiclesRaw from "@/data/vehicles.json";
import type { ImageManifestEntry, Vehicle } from "@/lib/types";
import { VehicleImage } from "@/components/ui/VehicleImage";

export const dynamic = "force-dynamic";

export default function DevImageAuditPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const vehicles = vehiclesRaw as Vehicle[];
  const manifest = manifestRaw as ImageManifestEntry[];
  const manifestMap = new Map(manifest.map((m) => [m.file, m]));

  return (
    <main id="main-content" className="min-h-screen bg-bg px-4 py-10 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="border-b border-line pb-6">
          <p className="kicker">Development Only · Not Linked From UI</p>
          <h1 className="mt-2 font-display text-display-md font-bold">
            Vehicle Image Integrity Audit ({vehicles.length} vehicles)
          </h1>
          <p className="mt-2 text-sm text-muted">
            Confirm by eye that every vehicle photo matches the exact Year, Make, Model, and Body
            Style printed beside it.
          </p>
        </header>

        <div className="grid gap-6">
          {vehicles.map((v) => (
            <article
              key={v.id}
              className="grid gap-6 rounded-lg border border-line bg-surface p-5 md:grid-cols-12"
            >
              <div className="flex flex-col justify-between md:col-span-5">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-champagne">
                    {v.id} · {v.bodyType} · {v.color}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
                    {v.year} {v.make} {v.model}
                  </h2>
                  <p className="mt-2 font-mono text-xs text-muted">{v.location}</p>
                </div>

                <div className="mt-4 space-y-2 border-t border-line pt-4 font-mono text-xs text-muted">
                  {v.images.map((file) => {
                    const entry = manifestMap.get(file);
                    return (
                      <div key={file} className="space-y-1">
                        <p className="text-ink">{file}</p>
                        {entry ? (
                          <>
                            <p>
                              Source: {entry.source} · License: {entry.license} · Verified:{" "}
                              <span className="text-champagne">{entry.verifiedBy}</span>
                            </p>
                            <a
                              href={entry.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block truncate text-signal hover:underline"
                            >
                              {entry.sourceUrl}
                            </a>
                          </>
                        ) : (
                          <p className="text-signal">MISSING MANIFEST ENTRY</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:col-span-7">
                {v.images.map((file) => (
                  <div
                    key={file}
                    className="relative aspect-[16/10] overflow-hidden rounded-md border border-line bg-elevated"
                  >
                    <VehicleImage
                      src={file}
                      alt={`${v.year} ${v.make} ${v.model}`}
                      sizes="(max-width: 768px) 100vw, 55vw"
                    />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
