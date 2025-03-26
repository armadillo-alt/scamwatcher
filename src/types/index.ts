
export type RiskLevel = 'high' | 'medium' | 'low';

export type ScreenshotStatus = 'reviewed' | 'unreviewed';

export interface Screenshot {
  id: string;
  screenshot_url: string;
  original_url?: string;
  timestamp: string;
  parent_id: string;
  ocr_text?: string;
  risk_level: RiskLevel;
  status: ScreenshotStatus;
  notes?: string;
}

export interface FilterOptions {
  risk_level: RiskLevel | 'all';
  status: ScreenshotStatus | 'all';
  sort: 'newest' | 'oldest';
}
