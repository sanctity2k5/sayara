"use client";

import { useState } from "react";
import { Check, Inbox, MessageSquarePlus, X } from "lucide-react";
import { toast } from "sonner";
import { useSayaraStore } from "@/store/useSayaraStore";
import { selectActiveVehicles } from "@/store/selectors";
import { SIMULATED_BUYER_TEMPLATES } from "@/lib/analytics";
import { cn, formatDate, formatPrice } from "@/lib/utils";

export default function InquiriesInboxPage() {
  const inquiries = useSayaraStore((s) => s.inquiries);
  const activeVehicles = useSayaraStore(selectActiveVehicles);
  const currency = useSayaraStore((s) => s.preferences.currency);
  const addInquiry = useSayaraStore((s) => s.addInquiry);
  const updateInquiryStatus = useSayaraStore((s) => s.updateInquiryStatus);
  const markInquiryRead = useSayaraStore((s) => s.markInquiryRead);

  const [selectedId, setSelectedId] = useState<string | null>(inquiries[0]?.id ?? null);
  const [counterInput, setCounterInput] = useState("");

  const selected = inquiries.find((i) => i.id === selectedId) ?? inquiries[0] ?? null;

  const handleSimulateBuyer = () => {
    const vehicle =
      activeVehicles[inquiries.length % Math.max(1, Math.min(12, activeVehicles.length))];
    if (!vehicle) return;
    const tpl =
      SIMULATED_BUYER_TEMPLATES[inquiries.length % SIMULATED_BUYER_TEMPLATES.length];
    const created = addInquiry({
      vehicleId: vehicle.id,
      vehicleTitle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      buyerName: tpl.buyerName,
      buyerEmail: tpl.buyerEmail,
      offerPrice: Math.round(vehicle.price * tpl.discountPct),
      message: tpl.message,
      source: tpl.source,
    });
    setSelectedId(created.id);
    setCounterInput(String(created.offerPrice));
    toast.success(`New simulated buyer inquiry from ${tpl.buyerName}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="kicker">Buyer Conversations</p>
          <h1 className="mt-1.5 font-display text-display-md font-bold">Inquiries Inbox</h1>
        </div>
        <button
          type="button"
          onClick={handleSimulateBuyer}
          className="inline-flex items-center gap-2 rounded-md bg-signal px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-signal-hover"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span>Simulate Buyer Message</span>
        </button>
      </header>

      {inquiries.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface p-14 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted" />
          <h2 className="mt-4 font-display text-2xl font-bold">Inbox is empty</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Submit an inquiry from any vehicle page or generate a simulated buyer offer above.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-5">
            {inquiries.map((inq) => {
              const active = selected?.id === inq.id;
              return (
                <button
                  key={inq.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(inq.id);
                    setCounterInput(String(inq.offerPrice));
                    if (!inq.read) markInquiryRead(inq.id);
                  }}
                  className={cn(
                    "w-full rounded-lg border p-4 text-left transition",
                    active
                      ? "border-signal bg-surface"
                      : "border-line bg-surface/60 hover:border-ink/30"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!inq.read && <span className="h-2 w-2 rounded-full bg-signal" />}
                      <span className="font-semibold text-ink">{inq.buyerName}</span>
                    </div>
                    <span className="rounded-sm bg-elevated px-2 py-0.5 font-mono text-[10px] uppercase text-champagne">
                      {inq.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted">{inq.vehicleTitle}</p>
                  <p className="mt-2 font-mono text-xs font-semibold text-ink">
                    Offer: {formatPrice(inq.offerPrice, currency)}
                  </p>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="rounded-lg border border-line bg-surface p-6 lg:col-span-7">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
                <div>
                  <p className="kicker">
                    {selected.source} Lead · {formatDate(selected.createdAt)}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold">{selected.vehicleTitle}</h2>
                  <p className="mt-1 text-xs text-muted">
                    From <span className="text-ink">{selected.buyerName}</span> (
                    {selected.buyerEmail})
                  </p>
                </div>
                <span className="rounded-md border border-line bg-bg px-3 py-1 font-mono text-xs uppercase text-champagne">
                  {selected.status}
                </span>
              </div>

              <div className="mt-5 rounded-md border border-line bg-bg p-4">
                <p className="text-sm leading-relaxed text-ink">{selected.message}</p>
                <div className="mt-4 flex flex-wrap gap-6 border-t border-line pt-3 font-mono text-xs">
                  <span>
                    Buyer Offer:{" "}
                    <strong className="text-champagne">
                      {formatPrice(selected.offerPrice, currency)}
                    </strong>
                  </span>
                  {selected.counterPrice && (
                    <span>
                      Your Counter:{" "}
                      <strong className="text-signal">
                        {formatPrice(selected.counterPrice, currency)}
                      </strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      updateInquiryStatus(selected.id, "accepted");
                      toast.success("Offer accepted");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-emerald-500"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Accept Offer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateInquiryStatus(selected.id, "declined");
                      toast("Offer declined");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-line bg-bg px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted hover:text-signal"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Decline</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row">
                  <input
                    type="number"
                    value={counterInput}
                    onChange={(e) => setCounterInput(e.target.value)}
                    placeholder="Counter-offer amount (USD)"
                    aria-label="Counter-offer amount in USD"
                    className="flex-1 rounded-md border border-line bg-bg px-3 py-2 font-mono text-sm text-ink"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = Number(counterInput);
                      if (!Number.isFinite(val) || val < 1000) {
                        toast.error("Enter a valid counter amount");
                        return;
                      }
                      updateInquiryStatus(selected.id, "countered", val);
                      toast.success(`Sent counter-offer of ${formatPrice(val, currency)}`);
                    }}
                    className="rounded-md bg-signal px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-signal-hover"
                  >
                    Send Counter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
