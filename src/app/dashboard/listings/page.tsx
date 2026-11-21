"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSayaraStore } from "@/store/useSayaraStore";
import { selectAllVehicles } from "@/store/selectors";
import { formatMileage, formatPrice } from "@/lib/utils";
import type { Vehicle, VehicleStatus } from "@/lib/types";
import { VehicleFormModal } from "@/components/dashboard/VehicleFormModal";
import { VehicleImage } from "@/components/ui/VehicleImage";
import { CustomSelect } from "@/components/ui/CustomSelect";

export default function DashboardListingsPage() {
  const allVehicles = useSayaraStore(selectAllVehicles);
  const prefs = useSayaraStore((s) => s.preferences);
  const setVehicleStatus = useSayaraStore((s) => s.setVehicleStatus);
  const deleteVehicle = useSayaraStore((s) => s.deleteVehicle);
  const bulkUpdateStatus = useSayaraStore((s) => s.bulkUpdateStatus);
  const bulkDeleteVehicles = useSayaraStore((s) => s.bulkDeleteVehicles);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allVehicles.filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (q) {
        const hay = `${v.year} ${v.make} ${v.model} ${v.location} ${v.bodyType}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allVehicles, query, statusFilter]);

  const columns = useMemo<ColumnDef<Vehicle>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Select all rows"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="accent-signal"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.make} ${row.original.model}`}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="accent-signal"
          />
        ),
      },
      {
        accessorKey: "make",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1"
          >
            <span>Vehicle</span>
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => {
          const v = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded border border-line bg-elevated">
                <VehicleImage
                  src={v.images[0]}
                  alt={`${v.year} ${v.make} ${v.model}`}
                  sizes="64px"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">
                  {v.year} {v.make} {v.model}
                </p>
                <p className="truncate font-mono text-[10px] text-muted">{v.location}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "price",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1"
          >
            <span>Price</span>
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-champagne">
            {formatPrice(row.original.price, prefs.currency)}
          </span>
        ),
      },
      {
        accessorKey: "mileage",
        header: "Mileage",
        cell: ({ row }) => (
          <span className="font-mono text-muted">
            {formatMileage(row.original.mileage, prefs.distanceUnit)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <CustomSelect
            value={row.original.status}
            ariaLabel={`Status for ${row.original.make} ${row.original.model}`}
            size="sm"
            className="w-28"
            buttonClassName="font-mono text-[11px] uppercase"
            onChange={(val) => {
              setVehicleStatus(row.original.id, val as VehicleStatus);
              toast.success(`Updated status to ${val}`);
            }}
            options={[
              { value: "active", label: "Active" },
              { value: "draft", label: "Draft" },
              { value: "sold", label: "Sold" },
            ]}
          />
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setEditing(row.original);
                setModalOpen(true);
              }}
              aria-label={`Edit ${row.original.make} ${row.original.model}`}
              className="rounded p-1.5 text-muted hover:bg-elevated hover:text-ink"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {confirmDeleteId === row.original.id ? (
              <button
                type="button"
                onClick={() => {
                  deleteVehicle(row.original.id);
                  setConfirmDeleteId(null);
                  toast.success("Listing deleted");
                }}
                className="rounded bg-signal px-2 py-1 font-mono text-[10px] font-semibold uppercase text-white"
              >
                Confirm
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDeleteId(row.original.id)}
                aria-label={`Delete ${row.original.make} ${row.original.model}`}
                className="rounded p-1.5 text-muted hover:bg-elevated hover:text-signal"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [confirmDeleteId, deleteVehicle, prefs.currency, prefs.distanceUnit, setVehicleStatus]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="kicker">Inventory Control</p>
          <h1 className="mt-1.5 font-display text-display-md font-bold">Listings Manager</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-md bg-signal px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-signal-hover"
        >
          <Plus className="h-4 w-4" />
          <span>Add Vehicle</span>
        </button>
      </header>

      {/* Filters & Bulk Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search inventory..."
              aria-label="Search listings"
              className="rounded-md border border-line bg-surface py-2 pl-9 pr-3 text-xs text-ink focus:border-signal focus:outline-none"
            />
          </div>

          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            ariaLabel="Filter by status"
            size="sm"
            className="w-36"
            buttonClassName="bg-surface py-2"
            options={[
              { value: "all", label: "All Statuses" },
              { value: "active", label: "Active" },
              { value: "draft", label: "Draft" },
              { value: "sold", label: "Sold" },
            ]}
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 text-xs">
            <span className="font-mono text-champagne">{selectedIds.length} selected</span>
            <button
              type="button"
              onClick={() => {
                bulkUpdateStatus(selectedIds, "active");
                setRowSelection({});
                toast.success("Marked selected as active");
              }}
              className="rounded bg-elevated px-2 py-1 text-ink hover:text-signal"
            >
              Set Active
            </button>
            <button
              type="button"
              onClick={() => {
                bulkUpdateStatus(selectedIds, "sold");
                setRowSelection({});
                toast.success("Marked selected as sold");
              }}
              className="rounded bg-elevated px-2 py-1 text-ink hover:text-signal"
            >
              Mark Sold
            </button>
            <button
              type="button"
              onClick={() => {
                bulkDeleteVehicles(selectedIds);
                setRowSelection({});
                toast.success("Deleted selected listings");
              }}
              className="rounded bg-signal px-2 py-1 text-white"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* TanStack Table */}
      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                className="border-b border-line font-mono text-[10px] uppercase tracking-[0.14em] text-muted"
              >
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3.5">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-line">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-elevated/40">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="font-mono">
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-ink disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-ink disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {modalOpen && (
        <VehicleFormModal
          key={editing?.id ?? "new"}
          open={modalOpen}
          editingVehicle={editing}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
