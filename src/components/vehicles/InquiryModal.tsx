"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, X } from "lucide-react";
import { toast } from "sonner";
import type { Vehicle } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useSayaraStore } from "@/store/useSayaraStore";

const inquirySchema = z.object({
  buyerName: z.string().min(2, "Please enter your full name"),
  buyerEmail: z.string().email("Please enter a valid email address"),
  offerPrice: z.coerce.number().min(1000, "Offer must be at least 1,000"),
  message: z.string().min(10, "Please include a short note (at least 10 characters)"),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

interface InquiryModalProps {
  vehicle: Vehicle;
  open: boolean;
  onClose: () => void;
}

export function InquiryModal({ vehicle, open, onClose }: InquiryModalProps) {
  const addInquiry = useSayaraStore((s) => s.addInquiry);
  const currency = useSayaraStore((s) => s.preferences.currency);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      buyerName: "",
      buyerEmail: "",
      offerPrice: vehicle.price,
      message: `Hello, I am interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model} listed in ${vehicle.location}. Is it available for inspection?`,
    },
  });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const onSubmit = (values: InquiryFormValues) => {
    addInquiry({
      vehicleId: vehicle.id,
      vehicleTitle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      buyerName: values.buyerName,
      buyerEmail: values.buyerEmail,
      offerPrice: values.offerPrice,
      message: values.message,
      source: "Direct",
    });
    toast.success("Inquiry saved to your SAYARA dashboard inbox (simulated).");
    reset();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg border border-line bg-surface p-6 text-ink shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <p className="kicker">Simulated Seller Inquiry</p>
            <h2 id="inquiry-modal-title" className="mt-1 font-display text-2xl font-bold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h2>
            <p className="mt-0.5 font-mono text-xs text-muted">
              Asking {formatPrice(vehicle.price, currency)} · {vehicle.location}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close inquiry modal"
            className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                Your Name
              </span>
              <input
                type="text"
                {...register("buyerName")}
                placeholder="Alex Mercer"
                className="mt-1.5 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-signal focus:outline-none"
              />
              {errors.buyerName && (
                <p className="mt-1 text-xs text-signal">{errors.buyerName.message}</p>
              )}
            </label>

            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                Email Address
              </span>
              <input
                type="email"
                {...register("buyerEmail")}
                placeholder="alex@example.com"
                className="mt-1.5 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-signal focus:outline-none"
              />
              {errors.buyerEmail && (
                <p className="mt-1 text-xs text-signal">{errors.buyerEmail.message}</p>
              )}
            </label>
          </div>

          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Offer Amount (USD)
            </span>
            <input
              type="number"
              {...register("offerPrice")}
              className="mt-1.5 w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-sm text-ink focus:border-signal focus:outline-none"
            />
            {errors.offerPrice && (
              <p className="mt-1 text-xs text-signal">{errors.offerPrice.message}</p>
            )}
          </label>

          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Message
            </span>
            <textarea
              rows={4}
              {...register("message")}
              className="mt-1.5 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-signal focus:outline-none"
            />
            {errors.message && (
              <p className="mt-1 text-xs text-signal">{errors.message.message}</p>
            )}
          </label>

          <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-line px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-signal px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-signal-hover disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send Inquiry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
