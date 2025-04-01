
import { createWorker } from 'tesseract.js';
import { RiskLevel } from '@/types';

// Suspicious keywords that might indicate scams
const SCAM_KEYWORDS = [
  "urgent", "immediately", "account suspended", "verify your account", 
  "click here", "limited time", "act now", "password expired", "security alert",
  "login attempt", "unusual activity", "prize", "lottery", "won", "winner",
  "claim your reward", "million dollars", "inheritance", "payment",
  "bank transfer", "verify", "authenticate", "suspicious activity",
  "gift card", "bitcoin", "crypto", "investment opportunity", "offer expires",
  "your account will be terminated", "unauthorized", "update your information"
];

// Suspicious domains and email patterns
const SUSPICIOUS_DOMAINS = [
  "support", "security", "help", "verify", "service", "admin",
  "team", "notification", "alert", "no-reply", "account", "billing"
];

/**
 * Extracts text from an image URL using Tesseract.js
 */
export const extractTextFromImage = async (imageUrl: string): Promise<string> => {
  try {
    console.log("Starting OCR processing for image:", imageUrl);
    
    // For Google Drive images, we may need a different approach
    // since Tesseract might not be able to access them directly
    if (imageUrl.includes('drive.google.com')) {
      console.log("Google Drive image detected, using special handling");
      // Extract file ID and use a direct link if possible
      let fileId = "";
      
      // Pattern for "drive.google.com/file/d/ID/view" format
      if (imageUrl.includes('/file/d/')) {
        const match = imageUrl.match(/\/file\/d\/([^/]+)/);
        if (match && match[1]) {
          fileId = match[1];
        }
      } 
      // Pattern for "drive.google.com/uc?id=ID" format
      else if (imageUrl.includes('id=')) {
        const match = imageUrl.match(/id=([^&]+)/);
        if (match && match[1]) {
          fileId = match[1];
        }
      }
      
      if (fileId) {
        imageUrl = `https://drive.google.com/uc?id=${fileId}&export=view`;
      }
    }
    
    const worker = await createWorker('eng');
    
    // Perform OCR on the image
    const result = await worker.recognize(imageUrl);
    console.log("OCR processing completed");
    
    // Clean up
    await worker.terminate();
    
    return result.data.text;
  } catch (error) {
    console.error("Error during OCR processing:", error);
    return "Error extracting text from image";
  }
};

/**
 * Analyzes text for potential scam indicators and returns a risk score
 */
export const analyzeTextForScams = (text: string): { score: number; matches: string[] } => {
  if (!text) return { score: 0, matches: [] };
  
  const textLower = text.toLowerCase();
  const matches: string[] = [];
  let score = 0;
  
  // Check for scam keywords
  SCAM_KEYWORDS.forEach(keyword => {
    if (textLower.includes(keyword.toLowerCase())) {
      matches.push(keyword);
      score += 5; // Each keyword adds 5 points to the risk score
    }
  });
  
  // Check for suspicious email patterns
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = textLower.match(emailRegex) || [];
  
  emails.forEach(email => {
    const domainPart = email.split('@')[0];
    
    // Check if the domain part contains any suspicious keywords
    SUSPICIOUS_DOMAINS.forEach(domain => {
      if (domainPart.includes(domain.toLowerCase())) {
        matches.push(`suspicious email: ${email}`);
        score += 8; // Suspicious emails are higher risk
      }
    });
  });
  
  // Check for URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = textLower.match(urlRegex) || [];
  
  if (urls.length > 0) {
    urls.forEach(url => {
      matches.push(`contains URL: ${url}`);
      score += 3; // Each URL adds some risk
    });
  }
  
  // Check for urgent language patterns
  const urgentPatterns = [
    /urgent|immediately|quickly/i,
    /today|now|expires/i,
    /limited time|act now/i
  ];
  
  urgentPatterns.forEach(pattern => {
    if (pattern.test(textLower)) {
      matches.push("urgent language");
      score += 7; // Urgency is a common scam tactic
    }
  });
  
  return { score, matches };
};

/**
 * Determines risk level based on the scam score
 */
export const getRiskLevelFromScore = (score: number): RiskLevel => {
  if (score >= 20) return "high";
  if (score >= 10) return "medium";
  return "low";
};

/**
 * Complete analysis function that takes an image URL and returns OCR text and risk assessment
 */
export const analyzeScreenshot = async (imageUrl: string) => {
  const extractedText = await extractTextFromImage(imageUrl);
  const analysis = analyzeTextForScams(extractedText);
  const riskLevel = getRiskLevelFromScore(analysis.score);
  
  return {
    ocr_text: extractedText,
    risk_level: riskLevel,
    scam_score: analysis.score,
    matched_patterns: analysis.matches
  };
};
