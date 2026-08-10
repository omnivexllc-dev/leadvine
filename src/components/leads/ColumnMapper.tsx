import React, { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  FileSpreadsheet,
  MapPin,
  Layers,
  DollarSign,
  CheckCircle2,
  Info,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Check,
  HelpCircle,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";
import { FieldMapping } from "./LeadImport";

export interface TargetFieldDef {
  key: keyof FieldMapping;
  label: string;
  description: string;
  required?: boolean;
  icon: React.ElementType;
  example: string;
}

export const TARGET_LEAD_FIELDS: TargetFieldDef[] = [
  {
    key: "name",
    label: "Lead / Company Name",
    description: "Primary name of the lead or target company",
    required: true,
    icon: Building2,
    example: "Acme Solutions LLC",
  },
  {
    key: "email",
    label: "Email Address",
    description: "Primary contact email address for outreach",
    icon: Mail,
    example: "contact@acme.com",
  },
  {
    key: "phone",
    label: "Phone Number",
    description: "Primary telephone or mobile number",
    icon: Phone,
    example: "+1 (555) 019-2831",
  },
  {
    key: "website",
    label: "Website URL",
    description: "Full web URL for company website",
    icon: Globe,
    example: "https://acmesolutions.com",
  },
  {
    key: "domain",
    label: "Domain Name",
    description: "Clean domain (e.g., acmesolutions.com)",
    icon: FileSpreadsheet,
    example: "acmesolutions.com",
  },
  {
    key: "city",
    label: "City / Location",
    description: "Primary city or municipality location",
    icon: MapPin,
    example: "Austin, TX",
  },
  {
    key: "address",
    label: "Street Address",
    description: "Full physical street or office address",
    icon: MapPin,
    example: "100 Congress Ave, Suite 400",
  },
  {
    key: "category",
    label: "Category / Industry",
    description: "Industry vertical, market segment, or tag",
    icon: Layers,
    example: "Software / Enterprise",
  },
  {
    key: "estimated_contract_value",
    label: "Estimated Value ($)",
    description: "Potential deal size or contract value in USD",
    icon: DollarSign,
    example: "15000",
  },
  {
    key: "status",
    label: "Lead Status",
    description: "Current stage in outreach lifecycle",
    icon: CheckCircle2,
    example: "New Lead",
  },
  {
    key: "notes",
    label: "Notes / Comments",
    description: "Free-form comments, context, or custom text",
    icon: Info,
    example: "High intent lead, interested in Q3 package",
  },
];

export interface ColumnMapperProps {
  rawHeaders: string[];
  rawDataRows: Record<string, unknown>[];
  mapping: FieldMapping;
  onMappingChange: (field: keyof FieldMapping, value: string) => void;
  onAutoMap: () => void;
  onResetMapping: () => void;
}

export function ColumnMapper({
  rawHeaders,
  rawDataRows,
  mapping,
  onMappingChange,
  onAutoMap,
  onResetMapping,
}: ColumnMapperProps) {
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Get mapped column header count
  const mappedCount = Object.values(mapping).filter((v) => Boolean(v)).length;
  const isNameMapped = Boolean(mapping.name);

  // Helper to get sample data values for a given raw header
  const getSampleValues = (headerName: string, limit = 2): string[] => {
    if (!headerName || rawDataRows.length === 0) return [];
    const samples: string[] = [];
    for (const row of rawDataRows) {
      const val = row[headerName];
      if (val !== undefined && val !== null && String(val).trim() !== "") {
        samples.push(String(val).trim());
        if (samples.length >= limit) break;
      }
    }
    return samples;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">
              Map Column Headers to Lead Fields
            </h3>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {mappedCount} of {TARGET_LEAD_FIELDS.length} Fields Mapped
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Connect column headers from your uploaded file ({rawHeaders.length} total columns
            detected) to database attributes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAutoMap}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Auto-Match Columns
          </button>
          <button
            type="button"
            onClick={onResetMapping}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>

          <div className="ml-auto sm:ml-2 flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Table view"
              className={`rounded-md p-1.5 text-xs transition-colors ${
                viewMode === "table"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              title="Card view"
              className={`rounded-md p-1.5 text-xs transition-colors ${
                viewMode === "cards"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Required field alert if missing */}
      {!isNameMapped && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <span className="font-semibold">Required Mapping Missing:</span> Please map a column
            header to <span className="font-bold underline">Lead / Company Name</span>. This is
            required to create lead records.
          </div>
        </div>
      )}

      {/* Dynamic Table View */}
      {viewMode === "table" ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold w-1/4">
                    Database Field
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold w-1/3">
                    Uploaded File Column Header
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Sample Data Preview
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right w-28">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {TARGET_LEAD_FIELDS.map((item) => {
                  const key = item.key;
                  const mappedHeader = mapping[key];
                  const Icon = item.icon;
                  const samples = getSampleValues(mappedHeader);

                  return (
                    <tr key={key} className="hover:bg-muted/20 transition-colors">
                      {/* Database Field info */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-semibold text-foreground">
                              {item.label}
                              {item.required && <span className="text-red-500 font-bold">*</span>}
                            </div>
                            <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Dropdown column selector */}
                      <td className="px-4 py-3.5 align-top">
                        <select
                          value={mapping[key] || ""}
                          onChange={(e) => onMappingChange(key, e.target.value)}
                          className={`w-full rounded-lg border px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 transition-all ${
                            mappedHeader
                              ? "border-primary/40 bg-background text-foreground focus:ring-primary/20"
                              : item.required
                                ? "border-amber-500/50 bg-amber-500/5 text-foreground focus:ring-amber-500/20"
                                : "border-border bg-background text-muted-foreground focus:ring-primary/20"
                          }`}
                        >
                          <option value="">-- Do Not Import / Ignore --</option>
                          {rawHeaders.map((header) => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Sample data preview */}
                      <td className="px-4 py-3.5 align-top">
                        {mappedHeader ? (
                          samples.length > 0 ? (
                            <div className="space-y-1">
                              {samples.map((sample, idx) => (
                                <div
                                  key={idx}
                                  className="truncate rounded bg-muted/40 px-2 py-1 font-mono text-[11px] text-foreground max-w-xs"
                                  title={sample}
                                >
                                  {sample}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] italic text-muted-foreground">
                              No sample data in first rows
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60 italic">
                            e.g. &quot;{item.example}&quot;
                          </span>
                        )}
                      </td>

                      {/* Mapping Status */}
                      <td className="px-4 py-3.5 align-top text-right">
                        {mappedHeader ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <Check className="h-3 w-3" />
                            Mapped
                          </span>
                        ) : item.required ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            Ignored
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TARGET_LEAD_FIELDS.map((item) => {
            const key = item.key;
            const mappedHeader = mapping[key];
            const Icon = item.icon;
            const samples = getSampleValues(mappedHeader);

            return (
              <div
                key={key}
                className={`flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all ${
                  mappedHeader
                    ? "border-primary/30 bg-card"
                    : item.required
                      ? "border-amber-500/40 bg-amber-500/5"
                      : "border-border bg-card/60"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                          {item.label}
                          {item.required && <span className="text-red-500 font-bold">*</span>}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">{item.description}</p>
                      </div>
                    </div>

                    {mappedHeader ? (
                      <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Mapped
                      </span>
                    ) : item.required ? (
                      <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                        Required
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      Map to Header:
                    </label>
                    <select
                      value={mapping[key] || ""}
                      onChange={(e) => onMappingChange(key, e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="">-- Do Not Import / Ignore --</option>
                      {rawHeaders.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sample data preview */}
                  {mappedHeader && samples.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        Sample values:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {samples.map((s, i) => (
                          <span
                            key={i}
                            className="truncate rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-foreground max-w-[200px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
