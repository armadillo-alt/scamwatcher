
import { useState } from "react";
import { AlertTriangle, Clock, Eye, LogOut, PieChart, RefreshCw, ShieldCheck } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScreenshots } from "@/hooks/useScreenshots";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import ScamCard from "@/components/ScamCard";
import DetailView from "@/components/DetailView";
import MetricCard from "@/components/MetricCard";
import { Screenshot } from "@/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Index = () => {
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  const {
    screenshots,
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
    refreshScreenshots
  } = useScreenshots();

  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleCardClick = (screenshot: Screenshot) => {
    setSelectedScreenshot(screenshot);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const parentOptions = Array.from(
    new Set(screenshots.map((s) => s.parent_id))
  );

  const handleParentChange = (parentId: string) => {
    console.log(`Changed to parent: ${parentId}`);
    // In a real app, you'd filter by parent here
  };

  const formatLastSubmissionTime = () => {
    if (!metrics.lastSubmission) return "No submissions yet";
    return format(metrics.lastSubmission, "MMM d, yyyy 'at' h:mm a");
  };

  const handleRefresh = () => {
    refreshScreenshots();
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-scamguard-background flex flex-col">
      <Header
        userName={user?.username || "Guest"}
        parentOptions={parentOptions}
        unreviewedCount={metrics.unreviewedCount}
        onParentChange={handleParentChange}
      />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-[1400px] animate-fade-in">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold mb-1">ScamGuard Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and manage potential scam attempts
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleRefresh} 
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Screenshots
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Screenshots This Week"
            value={metrics.thisWeek}
            icon={Eye}
          />
          <MetricCard
            title="High Risk Detections"
            value={metrics.highRisk}
            icon={AlertTriangle}
            textColor="text-scamguard-high"
          />
          <MetricCard
            title="Marked as Safe"
            value={metrics.markedSafe}
            icon={ShieldCheck}
          />
          <MetricCard
            title="Last Submission"
            value={formatLastSubmissionTime()}
            icon={Clock}
          />
        </div>

        <FilterBar filters={filters} onFilterChange={setFilters} />

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse flex flex-col items-center">
              <RefreshCw className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading screenshots...</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-2">Error Loading Screenshots</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && screenshots.length === 0 ? (
          <div className="bg-white border border-scamguard-border rounded-lg p-8 text-center">
            <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Screenshots Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No screenshots match your current filters. Try changing your filter settings or check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {screenshots.map((screenshot) => (
              <ScamCard
                key={screenshot.id}
                screenshot={screenshot}
                onCardClick={handleCardClick}
                onMarkSafe={markAsSafe}
                onMarkScam={markAsScam}
                onAddNotes={() => {
                  setSelectedScreenshot(screenshot);
                  setIsDetailOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      <DetailView
        screenshot={selectedScreenshot}
        onClose={handleCloseDetail}
        onMarkSafe={markAsSafe}
        onMarkScam={markAsScam}
        onAddNotes={addNotes}
        onSendInstruction={sendInstruction}
        isOpen={isDetailOpen}
      />
    </div>
  );
};

export default Index;
