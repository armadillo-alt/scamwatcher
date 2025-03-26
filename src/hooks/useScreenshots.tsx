import { useState, useEffect } from 'react';
import { Screenshot, FilterOptions } from '../types';
import { toast } from "sonner";

// Improved function to handle a shared Google Drive folder
const fetchGoogleDriveImages = async (folderId: string): Promise<Screenshot[]> => {
  try {
    // Since we're using a shared folder link, we'll create a more reliable approach
    // We'll use placeholder images with proper naming for now
    // In a production app, this would connect to a backend that processes the Drive folder
    
    // Placeholder screenshots with proper naming convention
    const mockScreenshots: Screenshot[] = [
      {
        id: "1",
        screenshot_url: "https://placehold.co/600x400/FFEEF0/F55/png?text=Security+Alert",
        original_url: `https://drive.google.com/file/d/1aBC123/view?usp=sharing`,
        timestamp: new Date().toISOString(),
        parent_id: "Home-PC",
        ocr_text: "Your computer has been infected with a virus. Call this number immediately to fix the issue: 1-800-555-0123",
        risk_level: "high",
        status: "unreviewed"
      },
      {
        id: "2",
        screenshot_url: "https://placehold.co/600x400/FFF5E6/FA2/png?text=Account+Update",
        original_url: `https://drive.google.com/file/d/2bCD456/view?usp=sharing`,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        parent_id: "Work-PC",
        ocr_text: "Your account needs to be updated. Please click here to verify your information within 24 hours.",
        risk_level: "medium",
        status: "unreviewed"
      },
      {
        id: "3",
        screenshot_url: "https://placehold.co/600x400/E6FFEF/2D5/png?text=Email+Login",
        original_url: `https://drive.google.com/file/d/3cDE789/view?usp=sharing`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        parent_id: "Home-PC",
        ocr_text: "Gmail sign-in page. Enter email and password.",
        risk_level: "low",
        status: "reviewed"
      },
      {
        id: "4",
        screenshot_url: "https://placehold.co/600x400/FFEEF0/F55/png?text=Lottery+Winner",
        original_url: `https://drive.google.com/file/d/4dEF012/view?usp=sharing`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        parent_id: "Work-PC",
        ocr_text: "Congratulations! You've won $5,000,000 in the international lottery. Send your details to claim your prize now!",
        risk_level: "high",
        status: "unreviewed"
      },
      {
        id: "5",
        screenshot_url: "https://placehold.co/600x400/E6FFEF/2D5/png?text=News+Article",
        original_url: `https://drive.google.com/file/d/5eFG345/view?usp=sharing`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        parent_id: "Home-PC",
        ocr_text: "Leading scientists discover breakthrough in Alzheimer's research that could lead to new treatments.",
        risk_level: "low",
        status: "reviewed"
      },
      {
        id: "6",
        screenshot_url: "https://placehold.co/600x400/FFF5E6/FA2/png?text=Bank+Alert",
        original_url: `https://drive.google.com/file/d/6gHI678/view?usp=sharing`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        parent_id: "Home-PC",
        ocr_text: "Your bank account has been temporarily locked due to suspicious activity. Click here to restore access.",
        risk_level: "medium",
        status: "unreviewed"
      }
    ];
    
    // This would be replaced with actual API call in production
    console.log("Attempting to access Google Drive folder with ID:", folderId);
    console.log("For a production app, you would need a backend service with proper Drive API integration");
    
    // Sort screenshots by timestamp (newest first)
    mockScreenshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return mockScreenshots;
  } catch (error) {
    console.error("Error accessing Google Drive folder:", error);
    throw error;
  }
};

// Shared folder ID from your Google Drive link
const DRIVE_FOLDER_ID = "15hieU52VWdlwZcHdou5b9OAEIwGiDhPh";

// More realistic mock data with different parent IDs
const MOCK_SCREENSHOTS: Screenshot[] = [
  {
    id: "1",
    screenshot_url: "https://placehold.co/600x400/FFEEF0/F55/png?text=Security+Alert",
    timestamp: "2025-03-26T14:45:00Z",
    parent_id: "Home-PC",
    ocr_text: "Your computer has been infected with a virus. Call this number immediately to fix the issue: 1-800-555-0123",
    risk_level: "high",
    status: "unreviewed"
  },
  {
    id: "2",
    screenshot_url: "https://placehold.co/600x400/FFF5E6/FA2/png?text=Account+Update",
    timestamp: "2025-03-26T13:30:00Z",
    parent_id: "Work-PC",
    ocr_text: "Your account needs to be updated. Please click here to verify your information within 24 hours.",
    risk_level: "medium",
    status: "unreviewed"
  },
  {
    id: "3",
    screenshot_url: "https://placehold.co/600x400/E6FFEF/2D5/png?text=Email+Login",
    timestamp: "2025-03-26T12:15:00Z",
    parent_id: "Home-PC",
    ocr_text: "Gmail sign-in page. Enter email and password.",
    risk_level: "low",
    status: "reviewed"
  },
  {
    id: "4",
    screenshot_url: "https://placehold.co/600x400/FFEEF0/F55/png?text=Lottery+Winner",
    timestamp: "2025-03-25T17:20:00Z",
    parent_id: "Work-PC",
    ocr_text: "Congratulations! You've won $5,000,000 in the international lottery. Send your details to claim your prize now!",
    risk_level: "high",
    status: "unreviewed"
  },
  {
    id: "5",
    screenshot_url: "https://placehold.co/600x400/E6FFEF/2D5/png?text=News+Article",
    timestamp: "2025-03-25T15:10:00Z",
    parent_id: "Home-PC",
    ocr_text: "Leading scientists discover breakthrough in Alzheimer's research that could lead to new treatments.",
    risk_level: "low",
    status: "reviewed"
  },
  {
    id: "6",
    screenshot_url: "https://placehold.co/600x400/FFF5E6/FA2/png?text=Bank+Alert",
    timestamp: "2025-03-25T11:45:00Z",
    parent_id: "Home-PC",
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
      // For now, since direct API access isn't working, we'll show informative message
      // and use the mock data for the demonstration
      setScreenshots(MOCK_SCREENSHOTS);
      setUseMockData(true);
      
      // Improved error message that explains the actual issue
      const message = "To access Google Drive directly from a browser, you need to set up a backend service " +
        "that uses the Google Drive API with proper authentication. Using sample data for demonstration.";
      setError(message);
      
      // Show helpful toast message
      toast.info("Using sample data - Google Drive integration requires a backend service", {
        description: "See console for more details on implementation options"
      });
      
      // Log more detailed information for the developer
      console.log("IMPLEMENTATION NOTE:");
      console.log("To properly access a Google Drive shared folder, you need to:");
      console.log("1. Create a Google Cloud project with Drive API enabled");
      console.log("2. Use a backend service with proper OAuth2 credentials");
      console.log("3. The backend would then fetch and process images from the Drive folder");
      console.log("4. Frontend would call your backend API instead of Google Drive directly");
      console.log("--");
      console.log("For security reasons, direct API access from frontend is limited");
    } catch (err) {
      console.error("Failed to load screenshots:", err);
      setScreenshots(MOCK_SCREENSHOTS);
      setUseMockData(true);
      setError("Failed to access Google Drive. Using sample data instead.");
      toast.error("Error accessing Google Drive folder");
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
