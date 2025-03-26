
import { useState, useEffect } from 'react';
import { Screenshot, FilterOptions } from '../types';
import { toast } from "sonner";

// Mock data for Screenshots
const MOCK_SCREENSHOTS: Screenshot[] = [
  {
    id: "1",
    screenshot_url: "https://placehold.co/600x400/FFEEF0/F55/png?text=Security+Alert",
    timestamp: "2025-03-26T14:45:00Z",
    parent_id: "Jane-PC",
    ocr_text: "Your computer has been infected with a virus. Call this number immediately to fix the issue: 1-800-555-0123",
    risk_level: "high",
    status: "unreviewed"
  },
  {
    id: "2",
    screenshot_url: "https://placehold.co/600x400/FFF5E6/FA2/png?text=Account+Update",
    timestamp: "2025-03-26T13:30:00Z",
    parent_id: "Robert-PC",
    ocr_text: "Your account needs to be updated. Please click here to verify your information within 24 hours.",
    risk_level: "medium",
    status: "unreviewed"
  },
  {
    id: "3",
    screenshot_url: "https://placehold.co/600x400/E6FFEF/2D5/png?text=Email+Login",
    timestamp: "2025-03-26T12:15:00Z",
    parent_id: "Jane-PC",
    ocr_text: "Gmail sign-in page. Enter email and password.",
    risk_level: "low",
    status: "reviewed"
  },
  {
    id: "4",
    screenshot_url: "https://placehold.co/600x400/FFEEF0/F55/png?text=Lottery+Winner",
    timestamp: "2025-03-25T17:20:00Z",
    parent_id: "Robert-PC",
    ocr_text: "Congratulations! You've won $5,000,000 in the international lottery. Send your details to claim your prize now!",
    risk_level: "high",
    status: "unreviewed"
  },
  {
    id: "5",
    screenshot_url: "https://placehold.co/600x400/E6FFEF/2D5/png?text=News+Article",
    timestamp: "2025-03-25T15:10:00Z",
    parent_id: "Jane-PC",
    ocr_text: "Leading scientists discover breakthrough in Alzheimer's research that could lead to new treatments.",
    risk_level: "low",
    status: "reviewed"
  },
  {
    id: "6",
    screenshot_url: "https://placehold.co/600x400/FFF5E6/FA2/png?text=Bank+Alert",
    timestamp: "2025-03-25T11:45:00Z",
    parent_id: "Jane-PC",
    ocr_text: "Your bank account has been temporarily locked due to suspicious activity. Click here to restore access.",
    risk_level: "medium",
    status: "unreviewed"
  }
];

export function useScreenshots() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>(MOCK_SCREENSHOTS);
  const [filteredScreenshots, setFilteredScreenshots] = useState<Screenshot[]>(screenshots);
  const [filters, setFilters] = useState<FilterOptions>({
    risk_level: 'all',
    status: 'all',
    sort: 'newest'
  });
  const [loading, setLoading] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);

  // Calculate metrics
  const metrics = {
    total: screenshots.length,
    thisWeek: screenshots.length,
    highRisk: screenshots.filter(s => s.risk_level === 'high').length,
    markedSafe: screenshots.filter(s => s.status === 'reviewed').length,
    unreviewedCount: screenshots.filter(s => s.status === 'unreviewed').length,
    lastSubmission: screenshots.length > 0 
      ? new Date(screenshots.reduce((latest, screenshot) => {
          return new Date(screenshot.timestamp) > new Date(latest.timestamp) 
            ? screenshot 
            : latest;
        }, screenshots[0]).timestamp) 
      : null
  };

  useEffect(() => {
    applyFilters();
  }, [filters, screenshots]);

  const applyFilters = () => {
    let filtered = [...screenshots];
    
    // Filter by risk level
    if (filters.risk_level !== 'all') {
      filtered = filtered.filter(s => s.risk_level === filters.risk_level);
    }
    
    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(s => s.status === filters.status);
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (filters.sort === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
    });
    
    setFilteredScreenshots(filtered);
  };
  
  const updateScreenshot = (id: string, updates: Partial<Screenshot>) => {
    setLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setScreenshots(prev => 
        prev.map(screenshot => 
          screenshot.id === id ? { ...screenshot, ...updates } : screenshot
        )
      );
      
      if (selectedScreenshot?.id === id) {
        setSelectedScreenshot(prev => prev ? { ...prev, ...updates } : null);
      }
      
      setLoading(false);
      toast.success("Screenshot updated successfully");
    }, 500);
  };
  
  const markAsSafe = (id: string) => {
    updateScreenshot(id, { status: 'reviewed' });
  };
  
  const markAsScam = (id: string) => {
    updateScreenshot(id, { status: 'reviewed' });
    toast("🚨 Reported as scam", {
      description: "This screenshot has been flagged as a scam."
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
    loading,
    selectedScreenshot,
    setSelectedScreenshot,
    markAsSafe,
    markAsScam,
    addNotes,
    sendInstruction,
    updateScreenshot
  };
}
