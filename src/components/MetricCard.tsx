
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string | number;
    positive: boolean;
  };
  bgColor?: string;
  textColor?: string;
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  bgColor = "bg-white", 
  textColor = "text-scamguard-text" 
}: MetricCardProps) {
  return (
    <Card className={`${bgColor} border border-scamguard-border rounded-lg p-4 hover-scale`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className={`text-2xl font-semibold ${textColor}`}>{value}</h3>
          
          {trend && (
            <div className={`text-xs flex items-center mt-1 ${trend.positive ? 'text-scamguard-low' : 'text-scamguard-high'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </div>
          )}
        </div>
        
        <div className="bg-scamguard-subtle p-2 rounded-md">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </Card>
  );
}

export default MetricCard;
