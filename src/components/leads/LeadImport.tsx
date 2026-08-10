import React, { useState, useMemo, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Database,
  RefreshCw,
  XCircle,
  Download,
  Search,
  Filter,
  Users,
  Building2,
  Info,
  Sparkles,
  Layers,
  Check,
  ChevronRight,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ColumnMapper } from "./ColumnMapper";
import {
  autoSuggestFieldMapping,
  validateHeaderMappings,
  extractCleanDomain,
  parseCSVData,
  detectDuplicateLeads,
  IncomingLeadCandidate,
} from "@/services/importUtils";

export interface LeadImportProps {
  onImportComplete?: (summary: {
    insertedCount: number;
    updatedCount: number;
    skippedCount: number;
    listName: string;
  }) => void;
  defaultListName?: string;
}

// Target database columns mapping options
export interface FieldMapping {
  name: string;
  domain: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  category: string;
  notes: string;
  estimated_contract_value: string;
  status: string;
}

export interface ParsedRecord {
  _id: string;
  _raw: Record<string, unknown>;
  _status: "valid" | "duplicate" | "invalid";
  _validationErrors: string[];
  _duplicateReason?: string;
  _selected: boolean;
  name: string;
  domain?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  category?: string;
  notes?: string;
  estimated_contract_value?: number;
  status?: string;
}

const SAMPLE_CSV_CONTENT = `Company Name,Website,Email,Phone,City,Category,Estimated Value,Notes
Acme Tech Solutions,https://acmetech.example.com,contact@acmetech.example.com,555-0192,Austin,Software,15000,Interested in web redesign
Nexus Dental Group,https://nexusdental.example.com,info@nexusdental.example.com,555-0143,Dallas,Healthcare,8500,Needs SEO audit
Apex Legal LLC,https://apexlegal.example.com,hello@apexlegal.example.com,555-0188,Houston,Legal Services,12000,High priority lead
Vanguard Bistro,,info@vanguardbistro.example.com,555-0122,San Antonio,Restaurant,4500,No website currently`;

export function LeadImport({ onImportComplete, defaultListName }: LeadImportProps) {
  // Wizard steps: 1: Upload, 2: Mapping, 3: Validation/Duplicates, 4: Preview, 5: Import/Finish
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1 State
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [listName, setListName] = useState<string>(
    defaultListName || `Imported Leads — ${new Date().toLocaleDateString()}`,
  );
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawDataRows, setRawDataRows] = useState<Record<string, unknown>[]>([]);

  // Step 2 State - Column Mapping
  const [mapping, setMapping] = useState<FieldMapping>({
    name: "",
    domain: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    category: "",
    notes: "",
    estimated_contract_value: "",
    status: "",
  });

  // Step 3 & 4 State - Processed records & Duplicate strategy
  const [duplicateStrategy, setDuplicateStrategy] = useState<"skip" | "update" | "allow">("skip");
  const [processedRecords, setProcessedRecords] = useState<ParsedRecord[]>([]);
  const [existingDbLeads, setExistingDbLeads] = useState<
    Array<{
      id?: string;
      name?: string;
      email?: string;
      phone?: string;
      website?: string;
      domain?: string;
    }>
  >([]);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Filtering for preview table
  const [filterType, setFilterType] = useState<"all" | "valid" | "duplicate" | "invalid">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Step 5 State - Execution
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [importResult, setImportResult] = useState<{
    inserted: number;
    updated: number;
    skipped: number;
    failed: number;
  } | null>(null);

  // Auto-suggest column mappings function
  const handleAutoMap = () => {
    if (rawHeaders.length === 0) return;
    const autoMap = autoSuggestFieldMapping(rawHeaders);
    setMapping(autoMap);
    toast.success("Auto-matched columns to lead fields.");
  };

  const handleResetMapping = () => {
    setMapping({
      name: "",
      domain: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      city: "",
      category: "",
      notes: "",
      estimated_contract_value: "",
      status: "",
    });
    toast.info("Cleared all column mappings.");
  };

  const handleMappingChange = (field: keyof FieldMapping, value: string) => {
    setMapping((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-suggest column mappings whenever rawHeaders changes
  useEffect(() => {
    if (rawHeaders.length === 0) return;
    const autoMap = autoSuggestFieldMapping(rawHeaders);
    setMapping(autoMap);
  }, [rawHeaders]);

  // Handle parsing CSV or Excel file
  const processFileContent = (fileToProcess: File) => {
    const filename = fileToProcess.name.toLowerCase();

    if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
            defval: "",
          });

          if (jsonData.length === 0) {
            toast.error("The selected Excel spreadsheet is empty.");
            return;
          }

          const headers = Object.keys(jsonData[0]);
          setRawHeaders(headers);
          setRawDataRows(jsonData);
          setFile(fileToProcess);
          toast.success(`Loaded Excel file with ${jsonData.length} rows.`);
          setCurrentStep(2);
        } catch {
          toast.error("Failed to parse Excel file. Please ensure it is a valid spreadsheet.");
        }
      };
      reader.readAsArrayBuffer(fileToProcess);
    } else {
      // Treat as CSV or TSV
      Papa.parse(fileToProcess, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data || results.data.length === 0) {
            toast.error("The uploaded CSV file is empty.");
            return;
          }
          const headers = results.meta.fields || Object.keys(results.data[0] as object);
          setRawHeaders(headers);
          setRawDataRows(results.data as Record<string, unknown>[]);
          setFile(fileToProcess);
          toast.success(`Parsed CSV with ${results.data.length} rows.`);
          setCurrentStep(2);
        },
        error: (err) => {
          toast.error(`CSV Parse Error: ${err.message}`);
        },
      });
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileContent(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFileContent(e.target.files[0]);
    }
  };

  const handleParsePastedText = () => {
    if (!pastedText.trim()) {
      toast.error("Please paste CSV or tab-separated data into the box.");
      return;
    }

    Papa.parse(pastedText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          toast.error("Could not parse any rows from pasted text.");
          return;
        }
        const headers = results.meta.fields || Object.keys(results.data[0] as object);
        setRawHeaders(headers);
        setRawDataRows(results.data as Record<string, unknown>[]);
        toast.success(`Parsed ${results.data.length} rows from pasted text.`);
        setCurrentStep(2);
      },
      error: (err) => {
        toast.error(`Parse error: ${err.message}`);
      },
    });
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_lead_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info("Sample CSV template downloaded!");
  };

  // Step 2 -> Step 3: Run Validation and Duplicate Detection
  const handleProceedToValidation = async () => {
    if (!mapping.name) {
      toast.error("Please map the required field: 'Lead / Company Name'");
      return;
    }

    setIsValidating(true);
    setCurrentStep(3);

    try {
      // Fetch existing leads from Supabase to check duplicates across database
      let dbLeads: Array<{
        id?: string;
        name?: string;
        email?: string;
        phone?: string;
        website?: string;
        domain?: string;
      }> = [];
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user?.id) {
          const { data } = await supabase
            .from("leads")
            .select("id, name, email, phone, website, domain")
            .eq("user_id", userData.user.id);
          dbLeads = data || [];
        }
      } catch (e) {
        console.warn("Could not query existing Supabase leads for duplicate check:", e);
      }
      setExistingDbLeads(dbLeads);

      // Prepare candidates for duplicate detection service
      const incomingCandidates: IncomingLeadCandidate[] = rawDataRows.map((row) => {
        const nameVal = String(row[mapping.name] || "").trim();
        const emailVal = mapping.email
          ? String(row[mapping.email] || "")
              .trim()
              .toLowerCase()
          : "";
        const phoneVal = mapping.phone ? String(row[mapping.phone] || "").trim() : "";
        const websiteVal = mapping.website ? String(row[mapping.website] || "").trim() : "";
        let domainVal = mapping.domain
          ? String(row[mapping.domain] || "")
              .trim()
              .toLowerCase()
          : "";
        if (!domainVal && websiteVal) {
          domainVal = extractCleanDomain(websiteVal);
        }
        return {
          name: nameVal,
          email: emailVal,
          phone: phoneVal,
          website: websiteVal,
          domain: domainVal,
        };
      });

      // Run duplicate detection service from importUtils
      const duplicateResults = detectDuplicateLeads(incomingCandidates, dbLeads);

      const processed: ParsedRecord[] = rawDataRows.map((row, index) => {
        const candidate = incomingCandidates[index];
        const dupMatch = duplicateResults[index];

        const cityVal = mapping.city ? String(row[mapping.city] || "").trim() : "";
        const addressVal = mapping.address ? String(row[mapping.address] || "").trim() : "";
        const categoryVal = mapping.category ? String(row[mapping.category] || "").trim() : "";
        const notesVal = mapping.notes ? String(row[mapping.notes] || "").trim() : "";
        const rawValue = mapping.estimated_contract_value
          ? row[mapping.estimated_contract_value]
          : "";
        const estimatedVal = rawValue
          ? parseFloat(String(rawValue).replace(/[^0-9.]/g, "")) || 0
          : 0;
        const statusVal = mapping.status ? String(row[mapping.status] || "").trim() : "new";

        const errors: string[] = [];

        // Validation Rules
        if (!candidate.name) {
          errors.push("Missing required Company / Lead Name");
        }

        if (candidate.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email)) {
          errors.push("Invalid email address format");
        }

        const isDup = dupMatch.isDuplicate;
        const dupReason = dupMatch.reason || "";

        const recordStatus: "valid" | "duplicate" | "invalid" =
          errors.length > 0 ? "invalid" : isDup ? "duplicate" : "valid";

        return {
          _id: `rec-${index}-${Date.now()}`,
          _raw: row,
          _status: recordStatus,
          _validationErrors: errors,
          _duplicateReason: dupReason,
          _selected: recordStatus !== "invalid", // auto select valid and duplicate by default
          name: nameVal,
          domain: domainVal,
          email: emailVal,
          phone: phoneVal,
          website: websiteVal,
          address: addressVal,
          city: cityVal,
          category: categoryVal,
          notes: notesVal,
          estimated_contract_value: estimatedVal,
          status: statusVal,
        };
      });

      setProcessedRecords(processed);
      toast.success("Validation & duplicate detection completed!");
    } catch (err: unknown) {
      toast.error(`Validation error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsValidating(false);
    }
  };

  // Toggle record selection
  const handleToggleSelect = (id: string) => {
    setProcessedRecords((prev) =>
      prev.map((r) => (r._id === id ? { ...r, _selected: !r._selected } : r)),
    );
  };

  // Toggle select all visible
  const handleToggleSelectAll = (checked: boolean) => {
    const visibleIds = new Set(filteredRecords.map((r) => r._id));
    setProcessedRecords((prev) =>
      prev.map((r) => (visibleIds.has(r._id) ? { ...r, _selected: checked } : r)),
    );
  };

  // Filtered records for data preview step
  const filteredRecords = useMemo(() => {
    return processedRecords.filter((r) => {
      if (filterType === "valid" && r._status !== "valid") return false;
      if (filterType === "duplicate" && r._status !== "duplicate") return false;
      if (filterType === "invalid" && r._status !== "invalid") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.name.toLowerCase().includes(q);
        const matchEmail = (r.email || "").toLowerCase().includes(q);
        const matchCity = (r.city || "").toLowerCase().includes(q);
        const matchCategory = (r.category || "").toLowerCase().includes(q);
        return matchName || matchEmail || matchCity || matchCategory;
      }
      return true;
    });
  }, [processedRecords, filterType, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = processedRecords.length;
    const valid = processedRecords.filter((r) => r._status === "valid").length;
    const duplicates = processedRecords.filter((r) => r._status === "duplicate").length;
    const invalid = processedRecords.filter((r) => r._status === "invalid").length;
    const selected = processedRecords.filter((r) => r._selected).length;
    return { total, valid, duplicates, invalid, selected };
  }, [processedRecords]);

  // Step 4 -> Step 5: Execute Bulk Database Import into Supabase
  const handleExecuteImport = async () => {
    const recordsToImport = processedRecords.filter((r) => r._selected);

    if (recordsToImport.length === 0) {
      toast.error("No leads are selected for import.");
      return;
    }

    setIsImporting(true);
    setCurrentStep(5);
    setImportProgress(10);

    let inserted = 0;
    const updated = 0;
    let skipped = 0;
    let failed = 0;

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      // 1. Create or reference Lead List if listName is provided
      let listId: string | null = null;
      if (userId && listName.trim()) {
        const { data: newList } = await supabase
          .from("lead_lists")
          .insert({
            name: listName.trim(),
            user_id: userId,
            description: `Imported on ${new Date().toLocaleString()}`,
          })
          .select("id")
          .single();

        if (newList) {
          listId = newList.id;
        }
      }

      // Filter based on duplicate strategy
      const finalPayloads: Record<string, unknown>[] = [];

      for (const rec of recordsToImport) {
        if (rec._status === "invalid") {
          failed++;
          continue;
        }

        if (rec._status === "duplicate" && duplicateStrategy === "skip") {
          skipped++;
          continue;
        }

        const payload: Record<string, unknown> = {
          name: rec.name,
          domain: rec.domain || null,
          email: rec.email || null,
          phone: rec.phone || null,
          website: rec.website || null,
          address: rec.address || null,
          city: rec.city || null,
          category: rec.category || null,
          notes: rec.notes || null,
          estimated_contract_value: rec.estimated_contract_value || 0,
          status: rec.status || "new",
          has_website: Boolean(rec.website),
        };

        if (userId) {
          payload.user_id = userId;
        }
        if (listId) {
          payload.list_id = listId;
        }

        finalPayloads.push(payload);
      }

      setImportProgress(30);

      // Insert in chunks of 50 to ensure reliability
      const BATCH_SIZE = 50;

      for (let i = 0; i < finalPayloads.length; i += BATCH_SIZE) {
        const batch = finalPayloads.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from("leads").insert(batch);

        if (error) {
          console.error("Batch insert error:", error);
          failed += batch.length;
        } else {
          inserted += batch.length;
        }

        const progressPercent = 30 + Math.floor(((i + batch.length) / finalPayloads.length) * 65);
        setImportProgress(progressPercent);
      }

      setImportProgress(100);
      setImportResult({ inserted, updated, skipped, failed });

      toast.success(`Successfully imported ${inserted} leads into "${listName}"!`);

      if (onImportComplete) {
        onImportComplete({
          insertedCount: inserted,
          updatedCount: updated,
          skippedCount: skipped,
          listName: listName.trim(),
        });
      }
    } catch (err: unknown) {
      toast.error(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
      setImportResult({ inserted, updated, skipped, failed: recordsToImport.length - inserted });
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setFile(null);
    setPastedText("");
    setRawHeaders([]);
    setRawDataRows([]);
    setProcessedRecords([]);
    setImportResult(null);
    setImportProgress(0);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Lead Connector Suite — Data Import Wizard
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Import & Validate Leads
          </h2>
          <p className="text-sm text-muted-foreground">
            Upload CSV/Excel files, map fields, detect duplicate records, and bulk insert into your
            Supabase CRM.
          </p>
        </div>

        {currentStep > 1 && currentStep < 5 && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Start New Import
          </button>
        )}
      </div>

      {/* Wizard Steps Indicator */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[
          { step: 1, label: "1. Upload File", icon: Upload },
          { step: 2, label: "2. Column Mapping", icon: Layers },
          { step: 3, label: "3. Validation Check", icon: AlertTriangle },
          { step: 4, label: "4. Review & Filter", icon: Search },
          { step: 5, label: "5. Import Summary", icon: CheckCircle2 },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step;

          return (
            <div
              key={s.step}
              className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                isActive
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : isDone
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                    : "border-border bg-muted/40 text-muted-foreground opacity-70"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-muted-foreground/20 text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : s.step}
              </div>
              <span className="truncate">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: UPLOAD FILE / PASTE CSV */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
              <div>
                <label className="text-sm font-semibold text-foreground">
                  Target Lead List Name
                </label>
                <p className="text-xs text-muted-foreground">
                  Leads will be saved under this list segment in Supabase
                </p>
              </div>
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="e.g. Austin Dental Practices Q3"
                className="w-full sm:w-80 rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Input Mode Selector */}
            <div className="flex gap-2 border-b border-border pb-3">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                  activeTab === "upload"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Upload File (.csv, .xlsx, .xls)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                  activeTab === "paste"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <FileText className="h-4 w-4" />
                Paste Raw Data / CSV
              </button>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download Sample Template
              </button>
            </div>

            {/* Tab 1: File Upload */}
            {activeTab === "upload" && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-10 text-center hover:border-primary/50 hover:bg-muted/40 transition-all cursor-pointer"
              >
                <input
                  type="file"
                  accept=".csv, .tsv, .xlsx, .xls, .txt"
                  onChange={handleFileInputChange}
                  className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                />
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                  <Upload className="h-7 w-7" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  Drag and drop your spreadsheet file here
                </h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                  Supports CSV, TSV, Microsoft Excel (.xlsx, .xls). File will be parsed and
                  validated automatically.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                  Browse Computer
                </div>
              </div>
            )}

            {/* Tab 2: Paste CSV */}
            {activeTab === "paste" && (
              <div className="space-y-3">
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste CSV or tab-separated text here..."
                  className="w-full rounded-xl border border-border bg-background p-4 text-xs font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setPastedText(SAMPLE_CSV_CONTENT)}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Copy className="h-3 w-3" /> Fill with Sample Data
                  </button>
                  <button
                    type="button"
                    onClick={handleParsePastedText}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Parse Data <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: COLUMN MAPPING */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <ColumnMapper
            rawHeaders={rawHeaders}
            rawDataRows={rawDataRows}
            mapping={mapping}
            onMappingChange={handleMappingChange}
            onAutoMap={handleAutoMap}
            onResetMapping={handleResetMapping}
          />

          <div className="flex justify-between items-center border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Upload
            </button>

            <button
              type="button"
              onClick={handleProceedToValidation}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Validate & Check Duplicates <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 & 4: VALIDATION PREVIEW & DUPLICATE SETTINGS */}
      {(currentStep === 3 || currentStep === 4) && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-xs text-muted-foreground font-medium">Total Rows</p>
              <p className="text-xl font-bold text-foreground mt-1">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Valid Leads
              </p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.valid}
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Duplicates Found
              </p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {stats.duplicates}
              </p>
            </div>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-center">
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                Invalid Records
              </p>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {stats.invalid}
              </p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="text-xs text-primary font-medium">Selected to Import</p>
              <p className="text-xl font-bold text-primary mt-1">{stats.selected}</p>
            </div>
          </div>

          {/* Duplicate Handling Strategy */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Duplicate Handling Strategy
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "skip",
                  title: "Skip Duplicates (Recommended)",
                  desc: "Excludes records matching existing leads in your database or file",
                },
                {
                  id: "allow",
                  title: "Import All as New",
                  desc: "Creates new lead records regardless of matching emails or domains",
                },
                {
                  id: "update",
                  title: "Update / Merge Existing",
                  desc: "Replaces existing database records with updated values",
                },
              ].map((strat) => (
                <label
                  key={strat.id}
                  className={`flex flex-col gap-1 rounded-lg border p-3 cursor-pointer transition-all ${
                    duplicateStrategy === strat.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-background hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="dupStrategy"
                      value={strat.id}
                      checked={duplicateStrategy === strat.id}
                      onChange={() => setDuplicateStrategy(strat.id as DuplicateStrategy)}
                      className="text-primary"
                    />
                    <span className="text-xs font-semibold text-foreground">{strat.title}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground pl-5">{strat.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all" as const, label: `All (${stats.total})` },
                  { id: "valid" as const, label: `Valid (${stats.valid})` },
                  { id: "duplicate" as const, label: `Duplicates (${stats.duplicates})` },
                  { id: "invalid" as const, label: `Invalid (${stats.invalid})` },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilterType(t.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      filterType === t.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lead preview..."
                  className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Data Grid Table */}
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredRecords.length > 0 && filteredRecords.every((r) => r._selected)
                        }
                        onChange={(e) => handleToggleSelectAll(e.target.checked)}
                        className="rounded"
                      />
                    </th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Company / Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Est. Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-background">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-muted-foreground text-xs">
                        No records match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => (
                      <tr
                        key={rec._id}
                        className={`hover:bg-muted/30 transition-colors ${
                          !rec._selected ? "opacity-50" : ""
                        }`}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={rec._selected}
                            onChange={() => handleToggleSelect(rec._id)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-3">
                          {rec._status === "valid" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" /> Valid
                            </span>
                          )}
                          {rec._status === "duplicate" && (
                            <span
                              title={rec._duplicateReason}
                              className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 cursor-help"
                            >
                              <AlertTriangle className="h-3 w-3" /> Duplicate
                            </span>
                          )}
                          {rec._status === "invalid" && (
                            <span
                              title={rec._validationErrors.join(", ")}
                              className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400 cursor-help"
                            >
                              <XCircle className="h-3 w-3" /> Invalid
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-medium text-foreground">{rec.name || "—"}</td>
                        <td className="p-3 text-muted-foreground">{rec.email || "—"}</td>
                        <td className="p-3 text-muted-foreground">{rec.phone || "—"}</td>
                        <td className="p-3 text-muted-foreground">{rec.city || "—"}</td>
                        <td className="p-3 text-muted-foreground">{rec.category || "—"}</td>
                        <td className="p-3 font-semibold text-foreground">
                          {rec.estimated_contract_value
                            ? `$${rec.estimated_contract_value.toLocaleString()}`
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-between items-center border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Mapping
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={stats.selected === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Database className="h-4 w-4" /> Import {stats.selected} Selected Leads
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: IMPORT EXECUTION & SUMMARY */}
      {currentStep === 5 && (
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm space-y-6 text-center">
          {isImporting ? (
            <div className="py-12 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse">
                <Database className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Inserting Leads into Supabase...
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Processing bulk batch records, building lead segments, and updating list indexing.
              </p>

              <div className="w-full max-w-md mx-auto bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <p className="text-xs font-semibold text-primary">{importProgress}% Completed</p>
            </div>
          ) : (
            <div className="py-6 space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-foreground">Import Complete!</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Your lead data has been processed and saved to list{" "}
                  <span className="font-semibold text-foreground">"{listName}"</span>.
                </p>
              </div>

              {/* Stats Result Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto text-center">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <p className="text-xs text-muted-foreground font-medium">Inserted</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {importResult?.inserted || 0}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground font-medium">Updated</p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {importResult?.updated || 0}
                  </p>
                </div>
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <p className="text-xs text-muted-foreground font-medium">Skipped</p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {importResult?.skipped || 0}
                  </p>
                </div>
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                  <p className="text-xs text-muted-foreground font-medium">Failed</p>
                  <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">
                    {importResult?.failed || 0}
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Import Another File
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
