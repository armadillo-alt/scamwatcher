
import { useState } from "react";
import { 
  AlertTriangle, 
  Calendar, 
  Check, 
  Clock, 
  Computer, 
  MessageSquare, 
  SendHorizontal, 
  X 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Screenshot } from "@/types";
import { format } from "date-fns";

interface DetailViewProps {
  screenshot: Screenshot | null;
  onClose: () => void;
  onMarkSafe: (id: string) => void;
  onMarkScam: (id: string) => void;
  onAddNotes: (id: string, notes: string) => void;
  onSendInstruction: (id: string, instruction: string) => void;
  isOpen: boolean;
}

export function DetailView({
  screenshot,
  onClose,
  onMarkSafe,
  onMarkScam,
  onAddNotes,
  onSendInstruction,
  isOpen
}: DetailViewProps) {
  const [notes, setNotes] = useState(screenshot?.notes || "");
  const [instruction, setInstruction] = useState("");

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

  const handleSaveNotes = () => {
    if (screenshot) {
      onAddNotes(screenshot.id, notes);
    }
  };

  const handleSendInstruction = () => {
    if (screenshot && instruction.trim()) {
      onSendInstruction(screenshot.id, instruction);
      setInstruction("");
    }
  };

  if (!screenshot) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Screenshot Details</DialogTitle>
            <Badge 
              className={`font-medium ${getBadgeColor(screenshot.risk_level)}`}
            >
              {screenshot.risk_level === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
              {screenshot.risk_level.charAt(0).toUpperCase() + screenshot.risk_level.slice(1)} Risk
            </Badge>
          </div>
          <DialogDescription>
            Review the screenshot and take appropriate action
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Computer className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Device:</span>
              <span className="font-medium">{screenshot.parent_id}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">
                {format(new Date(screenshot.timestamp), 'MMM d, yyyy')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">
                {format(new Date(screenshot.timestamp), 'h:mm a')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium capitalize">{screenshot.status}</span>
            </div>
          </div>
          
          <div className="border border-scamguard-border rounded-lg overflow-hidden">
            <img 
              src={screenshot.screenshot_url} 
              alt="Screenshot" 
              className="w-full object-contain max-h-[400px]"
            />
          </div>
          
          {screenshot.ocr_text && (
            <div>
              <h4 className="text-sm font-medium mb-2">Extracted Text:</h4>
              <div className="bg-scamguard-subtle p-3 rounded-md text-sm">
                {screenshot.ocr_text}
              </div>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium mb-2">Caregiver Notes:</h4>
            <Textarea
              placeholder="Add your notes about this screenshot..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={handleSaveNotes}
            >
              Save Notes
            </Button>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Send Instruction to Parent:</h4>
            <div className="flex gap-2">
              <Textarea
                placeholder="Type instructions for the parent..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="min-h-[50px]"
              />
              <Button 
                className="shrink-0" 
                onClick={handleSendInstruction}
                disabled={!instruction.trim()}
              >
                <SendHorizontal className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex sm:justify-between gap-2 sm:gap-0">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onMarkSafe(screenshot.id)}
              className="flex items-center"
            >
              <Check className="h-4 w-4 mr-2" />
              Mark as Safe
            </Button>
            <Button 
              variant="outline"
              onClick={() => onMarkScam(screenshot.id)}
              className="text-scamguard-high hover:text-scamguard-high/90 flex items-center"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Mark as Scam
            </Button>
          </div>
          
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DetailView;
