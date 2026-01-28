import { Sidebar } from "@/components/Sidebar";
import { useKpiRecords } from "@/hooks/use-kpi";
import { TargetVsShipOkChart, TrendLineChart } from "@/components/KpiCharts";
import { Card, CardContent } from "@/components/ui/card";

export default function Trends() {
  const { data: records, isLoading } = useKpiRecords();

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Performance Trends</h1>
            <p className="text-muted-foreground mt-1">Long-term analysis of team velocity and shipment metrics.</p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">Loading trends...</div>
            ) : records && (
              <>
                <Card className="border-border/50 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-6">Historical Velocity</h2>
                    <div className="h-[400px]">
                      <TrendLineChart data={records} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardContent className="p-6">
                     <h2 className="text-xl font-bold mb-6">Volume Analysis</h2>
                     <div className="h-[400px]">
                       <TargetVsShipOkChart data={records} />
                     </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
