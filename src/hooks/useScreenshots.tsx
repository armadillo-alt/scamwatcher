import { useState, useEffect } from 'react';
import { Screenshot, FilterOptions } from '../types';
import { toast } from "sonner";

// Function to parse Google Drive shared folder
const fetchGoogleDriveImages = async (folderId: string): Promise<Screenshot[]> => {
  try {
    // Get the folder metadata using Google Drive API
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=REDACTED-GOOGLE-API-KEY`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Google Drive folder');
    }
    
    const data = await response.json();
    console.log("Google Drive files:", data);
    
    if (!data.files || data.files.length === 0) {
      console.warn("No files found in Google Drive folder");
      throw new Error('No files found in Google Drive folder');
    }
    
    // Parse each file and create Screenshot objects
    const screenshots: Screenshot[] = data.files
      .filter((file: any) => file.mimeType.startsWith('image/')) // Only include images
      .map((file: any, index: number) => {
        // Construct direct thumbnail URL
        const thumbnailUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w600`;
        const originalUrl = `https://drive.google.com/uc?id=${file.id}`;
        
        // Extract timestamp and parent ID from filename when available
        // Expected format: "${hostname}_${YYYY}-${MM}-${DD}_${hh}-${mm}-${ss}"
        let timestamp = new Date().toISOString();
        let parentId = "Unknown-PC";
        
        const filenameMatch = file.name.match(/^([^_]+)_(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})/);
        
        if (filenameMatch) {
          parentId = filenameMatch[1];
          const dateTimeStr = filenameMatch[2].replace(/_/g, 'T').replace(/-/g, ':');
          try {
            timestamp = new Date(dateTimeStr.replace(/(\d{4}):(\d{2}):(\d{2})T(\d{2}):(\d{2}):(\d{2})/, '$1-$2-$3T$4:$5:$6')).toISOString();
          } catch (e) {
            console.warn("Could not parse timestamp from filename:", file.name, e);
          }
        } else {
          console.warn("Filename doesn't match expected format:", file.name);
        }
        
        // Create screenshot object with parsed data
        return {
          id: file.id,
          screenshot_url: thumbnailUrl,
          original_url: originalUrl,
          timestamp: timestamp,
          parent_id: parentId,
          ocr_text: "Text extraction not available for this screenshot",
          risk_level: determineRiskLevel(index), // Temporary random assignment
          status: "unreviewed"
        };
      });
    
    // Sort screenshots by timestamp (newest first)
    screenshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    console.log("Processed Google Drive screenshots:", screenshots);
    return screenshots;
  } catch (error) {
    console.error("Error fetching Google Drive images:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

// Temporary function to assign risk levels
const determineRiskLevel = (index: number): 'high' | 'medium' | 'low' => {
  const levels: ('high' | 'medium' | 'low')[] = ['low', 'medium', 'high'];
  return levels[index % 3];
};

// Google Drive shared folder ID
// This is extracted from the shared folder URL: https://drive.google.com/drive/folders/15hieU52VWdlwZcHdou5b9OAEIwGiDhPh
const DRIVE_FOLDER_ID = "15hieU52VWdlwZcHdou5b9OAEIwGiDhPh";

// Fallback mock data if Google Drive fetch fails
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
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [filteredScreenshots, setFilteredScreenshots] = useState<Screenshot[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    risk_level: 'all',
    status: 'all',
    sort: 'newest'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  // Fetch screenshots from Google Drive on component mount
  useEffect(() => {
    loadScreenshots();
  }, []);

  const loadScreenshots = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const driveScreenshots = await fetchGoogleDriveImages(DRIVE_FOLDER_ID);
      
      if (driveScreenshots.length > 0) {
        setScreenshots(driveScreenshots);
        setUseMockData(false);
        toast.success(`Loaded ${driveScreenshots.length} screenshots from Google Drive`);
      } else {
        // If no screenshots found, fallback to mock data
        setScreenshots(MOCK_SCREENSHOTS);
        setUseMockData(true);
        toast.info("No screenshots found in Google Drive, using sample data");
      }
    } catch (err) {
      console.error("Failed to load screenshots:", err);
      // Only use mock data as fallback when there's an error
      setScreenshots(MOCK_SCREENSHOTS);
      setUseMockData(true);
      setError("Failed to load screenshots from Google Drive. Using sample data instead.");
      toast.error("Error loading screenshots from Google Drive");
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const metrics = {
    total: screenshots.length,
    thisWeek: screenshots.filter(s => {
      const screenshotDate = new Date(s.timestamp);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return screenshotDate >= oneWeekAgo;
    }).length,
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

  // Apply filters whenever filters or screenshots change
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
  
  // Function to manually refresh the screenshots
  const refreshScreenshots = async () => {
    await loadScreenshots();
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
    error,
    selectedScreenshot,
    setSelectedScreenshot,
    markAsSafe,
    markAsScam,
    addNotes,
    sendInstruction,
    updateScreenshot,
    refreshScreenshots,
    useMockData
  };
}
