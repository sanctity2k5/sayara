"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  size?: "sm" | "md";
  className?: string;
  buttonClassName?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  ariaLabel,
  size = "md",
  className,
  buttonClassName,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        const cur = options.findIndex((o) => o.value === value);
        setHighlightIdx(cur >= 0 ? cur : 0);
      } else {
        setHighlightIdx((prev) => (prev + 1) % Math.max(1, options.length));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        const cur = options.findIndex((o) => o.value === value);
        setHighlightIdx(cur >= 0 ? cur : options.length - 1);
      } else {
        setHighlightIdx((prev) => (prev - 1 + options.length) % Math.max(1, options.length));
      }
    } else if (e.key === "Enter" || e.key === " ") {
      if (open && highlightIdx >= 0 && options[highlightIdx]) {
        e.preventDefault();
        onChange(options[highlightIdx].value);
        setOpen(false);
      }
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            if (next) {
              const cur = options.findIndex((o) => o.value === value);
              setHighlightIdx(cur >= 0 ? cur : 0);
            }
            return next;
          });
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border border-line bg-bg text-left text-ink transition hover:border-ink/35 focus:border-signal focus:outline-none",
          size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm",
          open && "border-signal",
          buttonClassName
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-muted")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-200",
            open && "rotate-180 text-signal"
          )}
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 z-50 mt-1.5 max-h-60 min-w-[160px] overflow-y-auto rounded-md border border-line bg-surface p-1 shadow-elevated"
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlighted = idx === highlightIdx;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightIdx(idx)}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 rounded px-2.5 py-2 text-xs transition",
                  isHighlighted ? "bg-elevated text-ink" : "text-ink/90",
                  isSelected && "font-semibold text-signal"
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-signal" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
