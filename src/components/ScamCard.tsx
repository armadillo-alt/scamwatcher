
import { AlertTriangle, Check, Clock, Eye, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Screenshot } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";

interface ScamCardProps {
  screenshot: Screenshot;
  onCardClick: (screenshot: Screenshot) => void;
  onMarkSafe: (id: string) => void;
  onMarkScam: (id: string) => void;
  onAddNotes: (id: string) => void;
}

export function ScamCard({ 
  screenshot, 
  onCardClick, 
  onMarkSafe, 
  onMarkScam, 
  onAddNotes 
}: ScamCardProps) {
  const [imageUrl, setImageUrl] = useState<string>(screenshot.screenshot_url);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    // Handle Google Drive URLs - convert them to direct image URLs if needed
    if (screenshot.screenshot_url && screenshot.screenshot_url.includes('drive.google.com/')) {
      // Extract file ID from Google Drive URL patterns
      let fileId = "";
      
      // Pattern for "drive.google.com/file/d/ID/view" format
      if (screenshot.screenshot_url.includes('/file/d/')) {
        const match = screenshot.screenshot_url.match(/\/file\/d\/([^/]+)/);
        if (match && match[1]) {
          fileId = match[1];
        }
      } 
      // Pattern for "drive.google.com/uc?id=ID" format
      else if (screenshot.screenshot_url.includes('id=')) {
        const match = screenshot.screenshot_url.match(/id=([^&]+)/);
        if (match && match[1]) {
          fileId = match[1];
        }
      }
      // Pattern for "drive.google.com/open?id=ID" format
      else if (screenshot.screenshot_url.includes('open?id=')) {
        const match = screenshot.screenshot_url.match(/open\?id=([^&]+)/);
        if (match && match[1]) {
          fileId = match[1];
        }
      }
      
      if (fileId) {
        // Use the Google Drive content API format for public files
        setImageUrl(`https://drive.google.com/uc?id=${fileId}&export=view`);
      } else {
        // If we couldn't extract the ID, use the original URL
        setImageUrl(screenshot.screenshot_url);
      }
    } else {
      setImageUrl(screenshot.screenshot_url);
    }
  }, [screenshot.screenshot_url]);

  const getBadgeColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-scamguard-high/10 text-scamguard-high border-scamguard-high/20';
      case 'medium':
        return 'bg-scamguard-medium/10 text-scamguard-medium border-scamguard-medium/20';
      case 'low':
        return 'bg-scamguard-low/10 text-scamguard-low border-scamguard-low/20';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const timeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onCardClick(screenshot);
  };

  const handleButtonClick = (
    e: React.MouseEvent,
    action: (id: string) => void
  ) => {
    e.stopPropagation();
    action(screenshot.id);
  };

  const handleImageError = () => {
    console.error(`Failed to load image: ${imageUrl}`);
    setImageError(true);
  };

  return (
    <Card 
      onClick={handleClick}
      className="border border-scamguard-border overflow-hidden cursor-pointer hover-lift rounded-lg animate-scale-in h-full"
    >
      <div className="flex flex-col h-full">
        <div className="relative">
          {imageError ? (
            <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500">
              Image unavailable
            </div>
          ) : (
            <img 
              src={imageUrl} 
              alt="Screenshot" 
              className="w-full h-40 object-cover"
              loading="eager"
              onError={handleImageError}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          <Badge 
            className={`absolute top-3 right-3 font-medium ${getBadgeColor(screenshot.risk_level)}`}
          >
            {screenshot.risk_level === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
            {screenshot.risk_level.charAt(0).toUpperCase() + screenshot.risk_level.slice(1)} Risk
          </Badge>
        </div>
        
        <div className="p-4 flex-grow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">{screenshot.parent_id || 'Unknown device'}</h3>
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {screenshot.timestamp ? timeAgo(screenshot.timestamp) : 'Unknown time'}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mb-1">
            {screenshot.timestamp ? formatDate(screenshot.timestamp) : 'No date available'}
          </p>
          
          {screenshot.ocr_text && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
              {screenshot.ocr_text}
            </p>
          )}
        </div>
        
        <div className="p-4 pt-0 mt-auto">
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={(e) => handleButtonClick(e, onMarkSafe)}
            >
              <Check className="h-4 w-4 mr-1" />
              <span className="text-xs">Safe</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="w-full text-scamguard-high hover:text-scamguard-high/90"
              onClick={(e) => handleButtonClick(e, onMarkScam)}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span className="text-xs">Scam</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={(e) => handleButtonClick(e, onAddNotes)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">Notes</span>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full mt-2"
            onClick={handleClick}
          >
            <Eye className="h-4 w-4 mr-1" />
            <span className="text-xs">View Details</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default ScamCard;
