
import { FilterOptions, RiskLevel, ScreenshotStatus } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, CheckCircle, SlidersHorizontal } from "lucide-react";

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const handleRiskChange = (value: string) => {
    onFilterChange({
      ...filters,
      risk_level: value as RiskLevel | 'all'
    });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value as ScreenshotStatus | 'all'
    });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({
      ...filters,
      sort: value as 'newest' | 'oldest'
    });
  };

  return (
    <div className="w-full bg-white border border-scamguard-border rounded-lg p-4 mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-sm font-medium">Filter & Sort</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select value={filters.risk_level} onValueChange={handleRiskChange}>
              <SelectTrigger className="h-9 min-w-[130px]">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-9 min-w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="unreviewed">Unreviewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select value={filters.sort} onValueChange={handleSortChange}>
            <SelectTrigger className="h-9 min-w-[130px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
