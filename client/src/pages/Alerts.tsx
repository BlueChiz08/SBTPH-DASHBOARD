import { Sidebar } from "@/components/Sidebar";
import { useKpiRecords } from "@/hooks/use-kpi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function Alerts() {
  const { data: records, isLoading } = useKpiRecords();

  // Simple logic to find underperforming teams (e.g., < 80% progress)
  const underperformers = records?.filter(r => {
    const target = Number(r.target);
    const shipOk = Number(r.newDepositShipOk);
    return target > 0 && (shipOk / target) < 0.8;
  }) || [];

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <div className="space-y-8 max-w-5xl mx-auto">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Alerts & Actions</h1>
            <p className="text-muted-foreground mt-1">Teams requiring attention based on KPI thresholds.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Checking performance metrics...</div>
            ) : underperformers.length === 0 ? (
              <Alert className="bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]/20">
                <CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" />
                <AlertTitle className="text-[hsl(var(--success))] font-bold ml-2">All Clear!</AlertTitle>
                <AlertDescription className="ml-2 text-[hsl(var(--success))]/80">
                  Great job! All teams are performing above the 80% threshold.
                </AlertDescription>
              </Alert>
            ) : (
              underperformers.map(record => {
                 const progress = (Number(record.newDepositShipOk) / Number(record.target)) * 100;
                 return (
                   <Card key={record.id} className="border-l-4 border-l-destructive shadow-sm">
                     <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
                       <div className="p-3 bg-destructive/10 rounded-full">
                         <AlertTriangle className="h-6 w-6 text-destructive" />
                       </div>
                       
                       <div className="flex-1">
                         <div className="flex justify-between items-center mb-2">
                           <h3 className="text-lg font-bold text-foreground">{record.team}</h3>
                           <span className="text-sm font-mono text-destructive font-bold">{progress.toFixed(1)}%</span>
                         </div>
                         <Progress value={progress} className="h-2 bg-destructive/10" indicatorClassName="bg-destructive" />
                         <p className="text-sm text-muted-foreground mt-2">
                           Target: {Number(record.target).toLocaleString()} • Achieved: {Number(record.newDepositShipOk).toLocaleString()}
                         </p>
                       </div>

                       <Button variant="outline" className="shrink-0 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive">
                         Contact Lead
                       </Button>
                     </CardContent>
                   </Card>
                 );
              })
            )}
          </div>
          
          <div className="mt-8">
             <Card>
               <CardHeader>
                 <CardTitle>System Thresholds</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="flex items-center justify-between p-3 border rounded-lg">
                   <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full bg-destructive"></div>
                     <span className="font-medium">Critical Underperformance</span>
                   </div>
                   <span className="font-mono text-muted-foreground">&lt; 50%</span>
                 </div>
                 <div className="flex items-center justify-between p-3 border rounded-lg">
                   <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full bg-[hsl(var(--warning))]"></div>
                     <span className="font-medium">At Risk</span>
                   </div>
                   <span className="font-mono text-muted-foreground">50% - 80%</span>
                 </div>
                 <div className="flex items-center justify-between p-3 border rounded-lg">
                   <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full bg-[hsl(var(--success))]"></div>
                     <span className="font-medium">On Track</span>
                   </div>
                   <span className="font-mono text-muted-foreground">&gt; 80%</span>
                 </div>
               </CardContent>
             </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
