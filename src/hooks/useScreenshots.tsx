import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Screenshot, FilterOptions } from "../types";
import { toast } from "sonner";

// Replace this with your *published* Google Sheets CSV link.
const SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSXTBfNghPw05Sah8c4GAwMlIN00taKsK5aMIMxPEMYTQ5usLAlyXdwTm8JumBt71DsA_qcVrC-mS33/pub?output=csv";

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
    ocr_text: "Gmail sign-in page. Enter email and password_
