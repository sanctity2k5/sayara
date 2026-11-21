"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus, ShieldCheck, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { Vehicle } from "@/lib/types";
import { compressImageFile, MAX_IMAGES_PER_LISTING } from "@/lib/image-storage";
import { useSayaraStore } from "@/store/useSayaraStore";
import { VehicleImage } from "@/components/ui/VehicleImage";
import { CustomSelect } from "@/components/ui/CustomSelect";

const vehicleFormSchema = z.object({
  make: z.string().min(2, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1980).max(2027),
  price: z.coerce.number().min(1000, "Minimum price is 1,000"),
  mileage: z.coerce.number().min(0),
  fuel: z.enum(["Petrol", "Diesel", "Hybrid", "Electric"]),
  transmission: z.enum(["Automatic", "Manual", "Dual-Clutch"]),
  bodyType: z.enum(["Sedan", "SUV", "Coupe", "Sports", "Convertible", "Truck", "Hatchback"]),
  color: z.string().min(2, "Exterior color is required"),
  location: z.string().min(2, "Location is required"),
  status: z.enum(["draft", "active", "sold"]),
  engine: z.string().min(2, "Engine spec is required"),
  horsepower: z.coerce.number().min(40).max(2500),
  torque: z.string().min(2),
  zeroToSixty: z.string().min(2),
  drivetrain: z.enum(["AWD", "RWD", "FWD", "4WD"]),
  seats: z.coerce.number().min(1).max(9),
  doors: z.coerce.number().min(2).max(5),
  vin: z.string().min(8, "VIN must be at least 8 characters"),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

interface VehicleFormModalProps {
  open: boolean;
  editingVehicle: Vehicle | null;
  onClose: () => void;
}

export function VehicleFormModal({ open, editingVehicle, onClose }: VehicleFormModalProps) {
  const addVehicle = useSayaraStore((s) => s.addVehicle);
  const updateVehicle = useSayaraStore((s) => s.updateVehicle);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [images, setImages] = useState<string[]>(editingVehicle?.images ?? []);
  const [photoConfirmed, setPhotoConfirmed] = useState(Boolean(editingVehicle));
  const [uploading, setUploading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: editingVehicle
      ? {
          make: editingVehicle.make,
          model: editingVehicle.model,
          year: editingVehicle.year,
          price: editingVehicle.price,
          mileage: editingVehicle.mileage,
          fuel: editingVehicle.fuel,
          transmission: editingVehicle.transmission,
          bodyType: editingVehicle.bodyType,
          color: editingVehicle.color,
          location: editingVehicle.location,
          status: editingVehicle.status,
          engine: editingVehicle.specs.engine,
          horsepower: editingVehicle.specs.horsepower,
          torque: editingVehicle.specs.torque,
          zeroToSixty: editingVehicle.specs.zeroToSixty,
          drivetrain: editingVehicle.specs.drivetrain,
          seats: editingVehicle.specs.seats,
          doors: editingVehicle.specs.doors,
          vin: editingVehicle.specs.vin,
        }
      : {
          make: "",
          model: "",
          year: 2024,
          price: 95000,
          mileage: 4500,
          fuel: "Petrol",
          transmission: "Automatic",
          bodyType: "Coupe",
          color: "Alpine Grey",
          location: "London, UK",
          status: "active",
          engine: "3.0L Twin-Turbo Inline-6",
          horsepower: 473,
          torque: "550 Nm",
          zeroToSixty: "3.8s",
          drivetrain: "AWD",
          seats: 4,
          doors: 2,
          vin: "SYR202400100911",
        },
  });

  const watchedYear = watch("year");
  const watchedMake = watch("make");
  const watchedModel = watch("model");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const remaining = MAX_IMAGES_PER_LISTING - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES_PER_LISTING} images per listing.`);
      return;
    }
    setUploading(true);
    try {
      const toProcess = files.slice(0, remaining);
      const compressed = await Promise.all(toProcess.map((f) => compressImageFile(f)));
      setImages((prev) => [...prev, ...compressed]);
      setPhotoConfirmed(false);
      toast.success(`Added ${compressed.length} compressed image(s)`);
    } catch {
      toast.error("Could not process one or more images.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onSubmit = (values: VehicleFormValues) => {
    if (images.length > 0 && !photoConfirmed) {
      toast.error('Please confirm "This photo shows the vehicle described above."');
      setStep(3);
      return;
    }

    const payload = {
      make: values.make.trim(),
      model: values.model.trim(),
      year: values.year,
      price: values.price,
      mileage: values.mileage,
      fuel: values.fuel,
      transmission: values.transmission,
      bodyType: values.bodyType,
      color: values.color.trim(),
      location: values.location.trim(),
      status: values.status,
      images,
      specs: {
        engine: values.engine.trim(),
        horsepower: values.horsepower,
        torque: values.torque.trim(),
        zeroToSixty: values.zeroToSixty.trim(),
        drivetrain: values.drivetrain,
        seats: values.seats,
        doors: values.doors,
        vin: values.vin.trim(),
      },
    };

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, payload);
      toast.success(`Updated ${payload.year} ${payload.make} ${payload.model}`);
      onClose();
    } else {
      const created = addVehicle(payload);
      if (created) {
        toast.success(`Created listing: ${payload.year} ${payload.make} ${payload.model}`);
        onClose();
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vehicle-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-line bg-surface p-6 text-ink shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <p className="kicker">Step 0{step} of 03</p>
            <h2 id="vehicle-form-title" className="mt-1 font-display text-2xl font-bold">
              {editingVehicle ? "Edit Vehicle Listing" : "Add Vehicle Listing"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close vehicle form"
            className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { n: 1 as const, label: "1. Identity" },
            { n: 2 as const, label: "2. Powertrain" },
            { n: 3 as const, label: "3. Media & Verify" },
          ].map((s) => (
            <button
              key={s.n}
              type="button"
              onClick={() => setStep(s.n)}
              className={`rounded-md py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition ${
                step === s.n
                  ? "bg-signal text-white"
                  : "border border-line bg-bg text-muted hover:text-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="font-mono text-[10px] uppercase text-muted">Make *</span>
                <input
                  {...register("make")}
                  placeholder="e.g. Porsche"
                  className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink"
                />
                {errors.make && <p className="mt-1 text-xs text-signal">{errors.make.message}</p>}
              </label>

              <label className="block">
                <span className="font-mono text-[10px] uppercase text-muted">Model *</span>
                <input
                  {...register("model")}
                  placeholder="e.g. 911 Carrera"
                  className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink"
                />
                {errors.model && <p className="mt-1 text-xs text-signal">{errors.model.message}</p>}
              </label>

              <label className="block">
                <span className="font-mono text-[10px] uppercase text-muted">Year</span>
                <input
                  type="number"
                  {...register("year")}
                  className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-sm text-ink"
                />
              </label>

              <label className="block">
                <span className="font-mono text-[10px] uppercase text-muted">Price (USD)</span>
                <input
                  type="number"
                  {...register("price")}
                  className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-sm text-ink"
                />
              </label>

              <label className="block">
                <span className="font-mono text-[10px] uppercase text-muted">Mileage (km)</span>
                <input
                  type="number"
                  {...register("mileage")}
                  className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-sm text-ink"
                />
              </label>

              <div className="block">
                <span className="font-mono text-[10px] uppercase text-muted">Body Type</span>
                <Controller
                  control={control}
                  name="bodyType"
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      ariaLabel="Body Type"
                      className="mt-1"
                      options={["Sedan", "SUV", "Coupe", "Sports", "Convertible", "Truck", "Hatchback"].map(
                        (b) => ({ value: b, label: b })
                      )}
                    />
                  )}
                />
              </div>

              <label className="block">
                <span className="font-mono text-[10px] uppercase text-muted">Exterior Color</span>
                <input
                  {...register("color")}
                  className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink"
                />
              </label>

              <label className="block">
                <span className="font-mono text-[10px] uppercase text-muted">Location</span>
                <input
                  {...register("location")}
                  placeholder="e.g. Zurich, Switzerland"
                  className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink"
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="font-mono text-[10px] uppercase text-muted">Engine</span>
                <input
                  {...register("engine")}
                  className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink"
                />
              </label>

              <div className="block">
                <span className="font-mono text-[10px] uppercase text-muted">Fuel</span>
                <Controller
                  control={control}
                  name="fuel"
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      ariaLabel="Fuel"
                      className="mt-1"
                      options={["Petrol", "Diesel", "Hybrid", "Electric"].map((f) => ({
                        value: f,
                        label: f,
                      }))}
                    />
                  )}
                />
              </div>

              <div className="block">
                <span className="font-mono text-[10px] uppercase text-muted">Transmission</span>
                <Controller
                  control={control}
                  name="transmission"
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      ariaLabel="Transmission"
                      className="mt-1"
                      options={["Automatic", "Manual", "Dual-Clutch"].map((t) => ({
                        value: t,
                        label: t,
                      }))}
                    />
                  )}
                />
              </div>

              <label className="block">
                <span className="font-mono text-[10px] uppercase text-muted">Horsepower</span>
                <input
                  type="number"
                  {...register("horsepower")}
                  className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-sm text-ink"
                />
              </label>

              <label className="block">
                <span className="font-mono text-[10px] uppercase text-muted">Torque</span>
                <input
                  {...register("torque")}
                  className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-sm text-ink"
                />
              </label>

              <label className="block">
                <span className="font-mono text-[10px] uppercase text-muted">0–60 mph</span>
                <input
                  {...register("zeroToSixty")}
                  className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-sm text-ink"
                />
              </label>

              <div className="block">
                <span className="font-mono text-[10px] uppercase text-muted">Drivetrain</span>
                <Controller
                  control={control}
                  name="drivetrain"
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      ariaLabel="Drivetrain"
                      className="mt-1"
                      options={["AWD", "RWD", "FWD", "4WD"].map((d) => ({ value: d, label: d }))}
                    />
                  )}
                />
              </div>

              <label className="block">
                <span className="font-mono text-[10px] uppercase text-muted">Seats</span>
                <input
                  type="number"
                  {...register("seats")}
                  className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-sm text-ink"
                />
              </label>

              <label className="block">
                <span className="font-mono text-[10px] uppercase text-muted">Doors</span>
                <input
                  type="number"
                  {...register("doors")}
                  className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-sm text-ink"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="font-mono text-[10px] uppercase text-muted">VIN</span>
                <input
                  {...register("vin")}
                  className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-sm text-ink"
                />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="block">
                <span className="font-mono text-[10px] uppercase text-muted">Listing Status</span>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      ariaLabel="Listing Status"
                      className="mt-1"
                      options={[
                        { value: "active", label: "Active (Visible in Marketplace)" },
                        { value: "draft", label: "Draft (Private)" },
                        { value: "sold", label: "Sold" },
                      ]}
                    />
                  )}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-muted">
                    Vehicle Photos ({images.length}/{MAX_IMAGES_PER_LISTING})
                  </span>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-line bg-elevated px-3 py-1.5 text-xs font-medium text-ink hover:border-signal">
                    <ImagePlus className="h-3.5 w-3.5" />
                    <span>{uploading ? "Compressing..." : "Upload Photos"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Image Integrity Preview beside stated Make & Model */}
                <div className="mt-4 rounded-lg border border-line bg-bg p-4">
                  <div className="flex items-center gap-2 text-xs text-champagne">
                    <ShieldCheck className="h-4 w-4 text-signal" />
                    <span className="font-mono uppercase tracking-[0.14em]">
                      Photo Integrity Verification
                    </span>
                  </div>
                  <p className="mt-2 font-display text-lg font-bold text-ink">
                    {watchedYear || "Year"} {watchedMake || "Make"} {watchedModel || "Model"}
                  </p>

                  {images.length === 0 ? (
                    <p className="mt-3 text-xs text-muted">
                      No photos uploaded yet. Listings without photos will display a neutral
                      &ldquo;Photo unavailable&rdquo; placeholder.
                    </p>
                  ) : (
                    <>
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {images.map((src, i) => (
                          <div
                            key={`${src.slice(0, 32)}-${i}`}
                            className="relative aspect-[16/10] overflow-hidden rounded-md border border-line bg-elevated"
                          >
                            <VehicleImage
                              src={src}
                              alt={`${watchedYear} ${watchedMake} ${watchedModel} preview ${i + 1}`}
                              sizes="200px"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setImages((prev) => prev.filter((_, idx) => idx !== i))
                              }
                              aria-label="Remove image"
                              className="absolute right-1.5 top-1.5 rounded bg-bg/85 p-1 text-ink hover:text-signal"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-md border border-line bg-surface p-3 text-xs text-ink">
                        <input
                          type="checkbox"
                          checked={photoConfirmed}
                          onChange={(e) => setPhotoConfirmed(e.target.checked)}
                          className="mt-0.5 accent-signal"
                        />
                        <span>This photo shows the vehicle described above.</span>
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-line pt-4">
            <button
              type="button"
              onClick={() => (step > 1 ? setStep((s) => (s - 1) as 1 | 2 | 3) : onClose())}
              className="rounded-md border border-line px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted hover:text-ink"
            >
              {step > 1 ? "Back" : "Cancel"}
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                className="rounded-md bg-signal px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-signal-hover"
              >
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                disabled={images.length > 0 && !photoConfirmed}
                className="rounded-md bg-signal px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-signal-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                {editingVehicle ? "Save Changes" : "Publish Listing"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
