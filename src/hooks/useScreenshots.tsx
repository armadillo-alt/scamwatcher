
import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Screenshot, FilterOptions, RiskLevel } from "../types";
import { toast } from "sonner";
import { analyzeScreenshot } from "@/utils/ocrUtils";

// Use your published Google Sheets CSV link.
const SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSXTBfNghPw05Sah8c4GAwMlIN00taKsK5aMIMxPEMYTQ5usLAlyXdwTm8JumBt71DsA_qcVrC-mS33/pub?gid=0&single=true&output=csv";

// Fallback mock data (used only if fetching from Google Sheets fails)
const MOCK_SCREENSHOTS: Screenshot[] = [
  {
    id: "1",
    screenshot_url: "https://placehold.co/600x400/FFEEF0/F55/png?text=Security+Alert",
    timestamp: "2025-03-26T14:45:00Z",
    parent_id: "Home-PC",
    ocr_text:
      "Your computer has been infected with a virus. Call this number immediately to fix the issue: 1-800-555-0123",
    risk_level: "high",
    status: "unreviewed",
  },
  {
    id: "2",
    screenshot_url: "https://placehold.co/600x400/FFF5E6/FA2/png?text=Account+Update",
    timestamp: "2025-03-26T13:30:00Z",
    parent_id: "Work-PC",
    ocr_text:
      "Your account needs to be updated. Please click here to verify your information within 24 hours.",
    risk_level: "medium",
    status: "unreviewed",
  },
  {
    id: "3",
    screenshot_url: "https://placehold.co/600x400/E6FFEF/2D5/png?text=Email+Login",
    timestamp: "2025-03-26T12:15:00Z",
    parent_id: "Home-PC",
    ocr_text: "Gmail sign-in page. Enter email and password.",
    risk_level: "low",
    status: "reviewed",
  },
  {
    id: "4",
    screenshot_url: "https://placehold.co/600x400/FFEEF0/F55/png?text=Lottery+Winner",
    timestamp: "2025-03-25T17:20:00Z",
    parent_id: "Work-PC",
    ocr_text:
      "Congratulations! You've won $5,000,000 in the international lottery. Send your details to claim your prize now!",
    risk_level: "high",
    status: "unreviewed",
  },
  {
    id: "5",
    screenshot_url: "https://placehold.co/600x400/E6FFEF/2D5/png?text=News+Article",
    timestamp: "2025-03-25T15:10:00Z",
    parent_id: "Home-PC",
    ocr_text:
      "Leading scientists discover breakthrough in Alzheimer's research that could lead to new treatments.",
    risk_level: "low",
    status: "reviewed",
  },
  {
    id: "6",
    screenshot_url: "https://placehold.co/600x400/FFF5E6/FA2/png?text=Bank+Alert",
    timestamp: "2025-03-25T11:45:00Z",
    parent_id: "Home-PC",
    ocr_text:
      "Your bank account has been temporarily locked due to suspicious activity. Click here to restore access.",
    risk_level: "medium",
    status: "unreviewed",
  },
];

export function useScreenshots() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [filteredScreenshots, setFilteredScreenshots] = useState<Screenshot[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    risk_level: "all",
    status: "all",
    sort: "newest",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [processingOcr, setProcessingOcr] = useState(false);

  useEffect(() => {
    loadScreenshots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadScreenshots = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(SHEETS_CSV_URL);
      if (!res.ok) {
        throw new Error("Failed to fetch from Google Sheets");
      }

      const csvText = await res.text();

      const parsed = Papa.parse(csvText, { header: true });
      const rows = parsed.data as any[];

      // IMPORTANT: Ensure the keys below match the column headers in your CSV.
      const initialData: Screenshot[] = rows.map((row) => ({
        id: row["id"] || "",
        screenshot_url: row["screenshot_url"] || "",
        // Preserve original timestamp if it exists, otherwise use current time
        timestamp: row["timestamp"] || new Date().toISOString(),
        parent_id: row["parent_id"] || "Unknown-PC",
        ocr_text: row["ocr_text"] || "", // Preserve existing OCR text if present
        risk_level: (row["risk_level"] as RiskLevel) || "low", // Preserve risk level if present
        status: row["status"] || "unreviewed",
        scam_score: row["scam_score"] ? Number(row["scam_score"]) : undefined,
        matched_patterns: row["matched_patterns"] ? JSON.parse(row["matched_patterns"]) : undefined
      }));

      setScreenshots(initialData);
      
      // Only process OCR for screenshots without OCR text
      const screenshotsToProcess = initialData.filter(s => !s.ocr_text);
      if (screenshotsToProcess.length > 0) {
        processOcrForScreenshots(screenshotsToProcess);
      } else {
        setProcessingOcr(false);
        toast.success("All screenshots already have OCR data");
      }
      
      setUseMockData(false);
    } catch (err) {
      console.error("Failed to load screenshots from Google Sheets:", err);
      const mockData = MOCK_SCREENSHOTS.map(screenshot => ({
        ...screenshot,
        // Preserve original OCR text and risk level in mock data
        ocr_text: screenshot.ocr_text || "",
        risk_level: screenshot.risk_level || "low" as RiskLevel
      }));
      setScreenshots(mockData);
      
      // Only process OCR for screenshots without OCR text
      const screenshotsToProcess = mockData.filter(s => !s.ocr_text);
      if (screenshotsToProcess.length > 0) {
        processOcrForScreenshots(screenshotsToProcess);
      }
      
      setUseMockData(true);
      setError("Using mock data – failed to fetch from Google Sheets");
      toast.info("Using mock data – Google Sheets not available");
    } finally {
      setLoading(false);
    }
  };

  // Process OCR and scam detection for screenshots
  const processOcrForScreenshots = async (screenshotsToProcess: Screenshot[]) => {
    if (screenshotsToProcess.length === 0) return;
    
    setProcessingOcr(true);
    toast.info(`Processing OCR for ${screenshotsToProcess.length} new screenshots...`);

    // Process screenshots in batches to avoid overwhelming the browser
    const batchSize = 2;
    const updatedScreenshots = [...screenshots];

    for (let i = 0; i < screenshotsToProcess.length; i += batchSize) {
      const batch = screenshotsToProcess.slice(i, i + batchSize);
      
      // Process batch in parallel
      await Promise.all(
        batch.map(async (screenshot) => {
          if (screenshot.screenshot_url) {
            try {
              console.log(`Processing OCR for screenshot ${screenshot.id}`);
              
              // Find the index of this screenshot in the full array
              const screenshotIndex = updatedScreenshots.findIndex(s => s.id === screenshot.id);
              if (screenshotIndex === -1) return;
              
              const analysis = await analyzeScreenshot(screenshot.screenshot_url);
              
              // Update screenshot with OCR results and risk level - ensure proper typing
              updatedScreenshots[screenshotIndex] = {
                ...updatedScreenshots[screenshotIndex],
                ocr_text: analysis.ocr_text || "No text detected",
                risk_level: analysis.risk_level as RiskLevel,
                scam_score: analysis.scam_score,
                matched_patterns: analysis.matched_patterns
              };
              
              // Update state incrementally to show progress
              setScreenshots([...updatedScreenshots]);
            } catch (error) {
              console.error(`Error processing OCR for screenshot ${screenshot.id}:`, error);
              // Don't let errors stop the whole process, but mark this one
              const screenshotIndex = updatedScreenshots.findIndex(s => s.id === screenshot.id);
              if (screenshotIndex !== -1) {
                updatedScreenshots[screenshotIndex] = {
                  ...updatedScreenshots[screenshotIndex],
                  ocr_text: "Error extracting text from image",
                };
                setScreenshots([...updatedScreenshots]);
              }
            }
          }
        })
      );
      
      // Short delay between batches to prevent browser from freezing
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setProcessingOcr(false);
    toast.success("OCR and scam detection completed!");
  };

  const refreshScreenshots = async () => {
    await loadScreenshots();
  };

  useEffect(() => {
    applyFilters();
  }, [filters, screenshots]);

  const applyFilters = () => {
    let filtered = [...screenshots];

    if (filters.risk_level !== "all") {
      filtered = filtered.filter((s) => s.risk_level === filters.risk_level);
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((s) => s.status === filters.status);
    }

    filtered.sort((a, b) => {
      if (filters.sort === "newest") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
    });

    setFilteredScreenshots(filtered);
  };

  const metrics = {
    total: screenshots.length,
    thisWeek: screenshots.filter((s) => {
      const screenshotDate = new Date(s.timestamp);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return screenshotDate >= oneWeekAgo;
    }).length,
    highRisk: screenshots.filter((s) => s.risk_level === "high").length,
    markedSafe: screenshots.filter((s) => s.status === "reviewed").length,
    unreviewedCount: screenshots.filter((s) => s.status === "unreviewed").length,
    lastSubmission:
      screenshots.length > 0
        ? new Date(
            screenshots.reduce((latest, screenshot) => {
              return new Date(screenshot.timestamp) > new Date(latest.timestamp)
                ? screenshot
                : latest;
            }, screenshots[0]).timestamp
          )
        : null,
  };

  const updateScreenshot = (id: string, updates: Partial<Screenshot>) => {
    setLoading(true);

    setTimeout(() => {
      setScreenshots((prev) =>
        prev.map((screenshot) =>
          screenshot.id === id ? { ...screenshot, ...updates } : screenshot
        )
      );

      if (selectedScreenshot?.id === id) {
        setSelectedScreenshot((prev) => (prev ? { ...prev, ...updates } : null));
      }

      setLoading(false);
      toast.success("Screenshot updated successfully");
    }, 500);
  };

  const markAsSafe = (id: string) => {
    updateScreenshot(id, { status: "reviewed" });
  };

  const markAsScam = (id: string) => {
    updateScreenshot(id, { status: "reviewed" });
    toast("🚨 Reported as scam", {
      description: "This screenshot has been flagged as a scam.",
    });
  };

  const addNotes = (id: string, notes: string) => {
    updateScreenshot(id, { notes });
  };

  const sendInstruction = (id: string, instruction: string) => {
    console.log(`Sending instruction to parent for screenshot ${id}: ${instruction}`);
    toast.success("Instruction sent to parent");
  };

  return {
    screenshots: filteredScreenshots,
    metrics,
    filters,
    setFilters,
    loading: loading || processingOcr,
    processingOcr,
    error,
    selectedScreenshot,
    setSelectedScreenshot,
    markAsSafe,
    markAsScam,
    addNotes,
    sendInstruction,
    updateScreenshot,
    refreshScreenshots,
    useMockData,
  };
}
