"use client";

import { useState, useSyncExternalStore } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { APP_CONFIG } from "@/lib/config";
import { estimateLocalStorageBytes } from "@/lib/image-storage";
import { useSayaraStore } from "@/store/useSayaraStore";
import { useTheme } from "@/components/providers/ThemeProvider";
import { CustomSelect } from "@/components/ui/CustomSelect";

const QUOTA_BYTES = 5 * 1024 * 1024; // ~5 MB

export default function DashboardSettingsPage() {
  const { theme, setTheme } = useTheme();
  const prefs = useSayaraStore((s) => s.preferences);
  const updatePreferences = useSayaraStore((s) => s.updatePreferences);
  const exportStateJson = useSayaraStore((s) => s.exportStateJson);
  const importStateJson = useSayaraStore((s) => s.importStateJson);
  const resetToSeed = useSayaraStore((s) => s.resetToSeed);

  const initialBytes = useSyncExternalStore(
    () => () => {},
    () => estimateLocalStorageBytes(),
    () => 0
  );
  const [usageOverride, setUsageOverride] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const usageBytes = usageOverride ?? initialBytes;
  const usagePct = Math.min(100, Math.round((usageBytes / QUOTA_BYTES) * 100));

  const handleExport = () => {
    const json = exportStateJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sayara-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported SAYARA JSON backup");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = importStateJson(text);
    if (res.ok) {
      toast.success("Backup imported successfully");
      setUsageOverride(estimateLocalStorageBytes());
    } else {
      toast.error(res.error ?? "Import failed");
    }
    e.target.value = "";
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="border-b border-line pb-6">
        <p className="kicker">Configuration & Portability</p>
        <h1 className="mt-1.5 font-display text-display-md font-bold">Settings</h1>
      </header>

      {/* Preferences */}
      <section className="space-y-5 rounded-lg border border-line bg-surface p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-line pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-semibold text-ink">Display Currency</h2>
            <p className="text-xs text-muted">
              Formatted via Intl APIs across inventory, comparison, and analytics.
            </p>
          </div>
          <CustomSelect
            value={prefs.currency}
            ariaLabel="Display currency"
            size="sm"
            className="w-28"
            buttonClassName="font-mono"
            onChange={(val) =>
              updatePreferences({
                currency: val as (typeof APP_CONFIG.supportedCurrencies)[number],
              })
            }
            options={APP_CONFIG.supportedCurrencies.map((cur) => ({ value: cur, label: cur }))}
          />
        </div>

        <div className="flex flex-col justify-between gap-3 border-b border-line pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-semibold text-ink">Distance Unit</h2>
            <p className="text-xs text-muted">Display odometer values in kilometers or miles.</p>
          </div>
          <div className="flex gap-1.5">
            {(["km", "mi"] as const).map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => updatePreferences({ distanceUnit: unit })}
                className={`rounded-md px-3.5 py-1.5 font-mono text-xs uppercase ${
                  prefs.distanceUnit === unit
                    ? "bg-signal text-white"
                    : "border border-line bg-bg text-muted hover:text-ink"
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-b border-line pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-semibold text-ink">Appearance Theme</h2>
            <p className="text-xs text-muted">Switch between dark showroom and light mode.</p>
          </div>
          <div className="flex gap-1.5">
            {(["dark", "light"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setTheme(mode)}
                className={`rounded-md px-3.5 py-1.5 font-mono text-xs uppercase ${
                  theme === mode
                    ? "bg-signal text-white"
                    : "border border-line bg-bg text-muted hover:text-ink"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <span className="block text-sm font-semibold text-ink">Reduced Motion</span>
            <span className="text-xs text-muted">
              Use fade-only landing transitions and disable scroll pinning.
            </span>
          </div>
          <input
            type="checkbox"
            checked={prefs.reducedMotion}
            onChange={(e) => updatePreferences({ reducedMotion: e.target.checked })}
            className="h-4 w-4 accent-signal"
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between gap-4">
          <div>
            <span className="block text-sm font-semibold text-ink">Saved Search Match Alerts</span>
            <span className="text-xs text-muted">
              Show new-match badges on your dashboard watchlist.
            </span>
          </div>
          <input
            type="checkbox"
            checked={prefs.emailAlerts}
            onChange={(e) => updatePreferences({ emailAlerts: e.target.checked })}
            className="h-4 w-4 accent-signal"
          />
        </label>
      </section>

      {/* Local Storage Quota & Backup */}
      <section className="space-y-5 rounded-lg border border-line bg-surface p-6">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-ink">Browser Storage Usage (~5 MB quota)</span>
            <span className="font-mono text-champagne">
              {(usageBytes / 1024).toFixed(1)} KB ({usagePct}%)
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-elevated">
            <div className="h-full bg-signal transition-all" style={{ width: `${usagePct}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-bg px-4 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-ink hover:border-champagne"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-line bg-bg px-4 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-ink hover:border-champagne">
            <Upload className="h-3.5 w-3.5" />
            <span>Import JSON</span>
            <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
          </label>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="ml-auto inline-flex items-center gap-2 rounded-md border border-signal/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-signal hover:bg-signal/10"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to Seed</span>
            </button>
          ) : (
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-md border border-line px-3 py-2 text-xs text-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToSeed();
                  setConfirmReset(false);
                  setUsageOverride(estimateLocalStorageBytes());
                  toast.success("Reset local data back to 24 verified seed vehicles");
                }}
                className="rounded-md bg-signal px-3.5 py-2 text-xs font-semibold text-white"
              >
                Confirm Reset
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
