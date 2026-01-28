import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface KpiCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "success" | "warning" | "danger" | "default";
  delay?: number;
}

export function KpiCard({ title, value, subValue, icon: Icon, trend, color = "default", delay = 0 }: KpiCardProps) {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    success: "text-[hsl(var(--success))] bg-[hsl(var(--success))]/10",
    warning: "text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10",
    danger: "text-destructive bg-destructive/10",
    default: "text-muted-foreground bg-muted",
  };

  const renderSubValue = (text: string) => {
    const parts = text.split(" - ");
    if (parts.length < 2) return text;

    const [percent, statusPart] = parts;
    const isSuccess = statusPart.includes("On Track");
    const isWarning = statusPart.includes("At Risk");
    const isDanger = statusPart.includes("Critical") || statusPart.includes("Behind Schedule");

    const statusColor = isSuccess 
      ? "text-[hsl(var(--success))]" 
      : isWarning 
        ? "text-[hsl(var(--warning))]" 
        : isDanger 
          ? "text-destructive" 
          : "text-muted-foreground";

    return (
      <span className="flex flex-wrap items-center gap-1">
        <span>{percent} - </span>
        <span className={cn("font-bold", statusColor)}>{statusPart}</span>
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-start">
            <div className={cn("p-3 rounded-xl", colorMap[color])}>
              <Icon className="w-6 h-6" />
            </div>
            {trend && (
              <div className={cn(
                "flex items-center text-sm font-bold px-2.5 py-1 rounded-full",
                trend.isPositive ? "text-[hsl(var(--success))] bg-[hsl(var(--success))]/10" : "text-destructive bg-destructive/10"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </div>
            )}
          </div>
          
          <div className="mt-4 flex-1 flex flex-col justify-end">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold font-display mt-1 tracking-tight text-foreground">{value}</h3>
            {subValue && (
              <p className="text-sm font-semibold text-muted-foreground mt-1">
                {renderSubValue(subValue)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
