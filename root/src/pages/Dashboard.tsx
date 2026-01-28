import { Sidebar } from "@/components/Sidebar";
import { useState, useMemo } from "react";
import { useKpiRecords, useKpiStats } from "@/hooks/use-kpi";
import { KpiCard } from "@/components/KpiCard";
import { TargetVsShipOkChart, BreakdownChart, TrendLineChart } from "@/components/KpiCharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Target, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedTeam, setSelectedTeam] = useState<string>("overall");

  const teams = ["OCENIA", "CYPRUS", "KENYA", "MOZAMBIQUE", "MALAWI", "JAMAICA", "BAHAMAS/GUYANA", "TRUCKS"];

  // Fetch data
  const { data: allRecords, isLoading } = useKpiRecords({});
  
  // Filter and aggregate records
  const filteredByDate = allRecords?.filter(r => {
    const recordDate = new Date(r.date);
    return recordDate.getMonth().toString() === selectedMonth && 
           recordDate.getFullYear().toString() === selectedYear;
  });

  const records = selectedTeam === "overall" 
    ? filteredByDate 
    : filteredByDate?.filter(r => r.team === selectedTeam);

  // YTD Calculation (January to current selected month of the selected year)
  const ytdRecords = allRecords?.filter(r => {
    const recordDate = new Date(r.date);
    const month = recordDate.getMonth();
    const year = recordDate.getFullYear();
    const teamMatch = selectedTeam === "overall" || r.team === selectedTeam;
    return year.toString() === selectedYear && 
           month <= parseInt(selectedMonth) && 
           teamMatch;
  });

  const ytdShipOk = ytdRecords?.reduce((sum, r) => sum + Number(r.newDepositShipOk), 0) || 0;
  
  // Get YTD Target (take the latest entered YTD target for each team in the selected year and sum them)
  const ytdTarget = useMemo(() => {
    const teamTargets = new Map();
    // Use ALL records for the year to find the target
    allRecords?.forEach(r => {
      const recordDate = new Date(r.date);
      if (recordDate.getFullYear().toString() === selectedYear && r.ytdTarget && Number(r.ytdTarget) > 0) {
        teamTargets.set(r.team, Number(r.ytdTarget));
      }
    });
    
    if (selectedTeam === "overall") {
      const sum = Array.from(teamTargets.values()).reduce((sum, t) => sum + t, 0);
      return sum;
    }
    return teamTargets.get(selectedTeam) || 0;
  }, [allRecords, selectedYear, selectedTeam]);

  const ytdProgress = ytdTarget > 0 ? (ytdShipOk / ytdTarget) * 100 : 0;
  
  // Stats calculation
  const stats = records ? {
    totalTarget: records.reduce((sum, r) => sum + Number(r.target), 0),
    totalShipOk: records.reduce((sum, r) => sum + Number(r.newDepositShipOk), 0),
    qualifiedInq: records.reduce((sum, r) => sum + Number(r.qualifiedInquiries), 0),
    newDeposits: records.reduce((sum, r) => sum + Number(r.newDeposit), 0),
  } : { totalTarget: 0, totalShipOk: 0, qualifiedInq: 0, newDeposits: 0 };

  const progress = stats.totalTarget > 0 ? (stats.totalShipOk / stats.totalTarget) * 100 : 0;

  const getStatus = (progressValue: number) => {
    if (progressValue >= 80) return { label: "On Track", color: "text-[hsl(var(--success))]" };
    if (progressValue >= 50) return { label: "At Risk", color: "text-[hsl(var(--warning))]" };
    return { label: "Critical", color: "text-destructive" };
  };

  const currentStatus = getStatus(progress);
  const ytdStatus = getStatus(ytdProgress);

  const upsellCount = records?.reduce((sum, r) => sum + Number(r.upsell || 0), 0) || 0;
  const upsellRate = stats.totalShipOk > 0 ? (upsellCount / stats.totalShipOk) * 100 : 0;

  const conversionRate = stats.qualifiedInq > 0 ? (stats.newDeposits / stats.qualifiedInq) * 100 : 0;

  // Weekly tracking logic
  const weeksInMonth = 4;
  const weeklyTarget = stats.totalTarget / weeksInMonth;
  const currentWeek = Math.min(Math.ceil(new Date().getDate() / 7), 4);
  const targetToDate = weeklyTarget * currentWeek;
  const isWeeklyOnTrack = stats.totalShipOk >= targetToDate;
  const weeklyStatus = isWeeklyOnTrack ? "On Track" : "Behind Schedule";
  const weeklyColor = isWeeklyOnTrack ? "text-[hsl(var(--success))]" : "text-destructive";

  const handleExportPDF = async () => {
    const element = document.getElementById("dashboard-content");
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4"); // Landscape
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("kpi-dashboard-report.pdf");
    } catch (err) {
      console.error("PDF export failed", err);
      alert("Failed to export PDF");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Sales Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of KPI performance and metrics</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px] bg-card border-border shadow-sm">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }).map((_, i) => (
                  <SelectItem key={i} value={i.toString()}>{format(new Date(2024, i, 1), "MMMM")}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px] bg-card border-border shadow-sm">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {["2023", "2024", "2025", "2026"].map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-[160px] bg-card border-border shadow-sm">
                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overall">Overall</SelectItem>
                {teams.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="shadow-sm" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div id="dashboard-content" className="space-y-8">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
               Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
            ) : (
              <>
                <KpiCard 
                  title="Total Target" 
                  value={stats.totalTarget.toLocaleString()} 
                  icon={Target}
                  color="default"
                  delay={0.1}
                />
                <KpiCard 
                  title="Ship OK" 
                  value={stats.totalShipOk.toLocaleString()} 
                  subValue={`${progress.toFixed(1)}% of Target - ${currentStatus.label} (${weeklyStatus})`}
                  icon={TrendingUp}
                  color="primary"
                  trend={{ value: parseFloat(progress.toFixed(1)), isPositive: progress >= 80 }}
                  delay={0.2}
                />
                <KpiCard 
                  title="Upsell Rate" 
                  value={`${upsellRate.toFixed(1)}%`}
                  icon={TrendingUp}
                  color="success"
                  trend={{ value: parseFloat(upsellRate.toFixed(1)), isPositive: true }}
                  delay={0.3}
                />
                <KpiCard 
                  title="Conversion" 
                  value={`${conversionRate.toFixed(1)}%`}
                  subValue={`${stats.newDeposits} Deposits / ${stats.qualifiedInq} Inquiries`}
                  icon={Users}
                  color="warning"
                  delay={0.4}
                />
                <KpiCard 
                  title="YTD Ship OK" 
                  value={ytdShipOk.toLocaleString()}
                  icon={TrendingUp}
                  color="success"
                  subValue={`${ytdProgress.toFixed(1)}% of annual target - ${ytdStatus.label}`}
                  delay={0.5}
                />
              </>
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                 <Skeleton className="h-[400px] col-span-2 rounded-xl" />
                 <Skeleton className="h-[400px] col-span-1 rounded-xl" />
              </>
            ) : records && (
              <>
                <TargetVsShipOkChart data={records.slice(0, 12)} />
                <BreakdownChart data={records} />
                <TrendLineChart data={records.slice(-6)} />
              </>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
