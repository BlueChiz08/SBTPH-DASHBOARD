import { Sidebar } from "@/components/Sidebar";
import { useKpiRecords, useDeleteKpiRecord } from "@/hooks/use-kpi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit2, Search, Filter } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { KpiForm } from "@/components/KpiForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { type KpiRecord } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DataTable() {
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const { data: records, isLoading } = useKpiRecords();
  const deleteMutation = useDeleteKpiRecord();
  const [editingRecord, setEditingRecord] = useState<KpiRecord | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const teams = ["OCENIA", "CYPRUS", "KENYA", "MOZAMBIQUE", "MALAWI", "JAMAICA", "BAHAMAS/GUYANA", "TRUCKS"];

  const filteredRecords = records?.filter(record => {
    const teamMatch = record.team.toLowerCase().includes(search.toLowerCase());
    const recordMonth = new Date(record.date).getMonth().toString();
    const monthMatch = selectedMonth === "all" || recordMonth === selectedMonth;
    return teamMatch && monthMatch;
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Records Database</h1>
              <p className="text-muted-foreground mt-1">Manage and audit all KPI entries.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search by team..." 
                  className="pl-9 bg-card"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px] bg-card border-border shadow-sm">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {format(new Date(2024, i, 1), "MMMM")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                  <TableHead className="text-right">Ship OK</TableHead>
                  <TableHead className="text-center">Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">Loading records...</TableCell>
                  </TableRow>
                ) : filteredRecords?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No records found.</TableCell>
                  </TableRow>
                ) : (
                  filteredRecords?.map((record) => {
                    const progress = Number(record.target) > 0 
                      ? (Number(record.newDepositShipOk) / Number(record.target)) * 100 
                      : 0;

                    return (
                      <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium font-mono text-xs">
                          {format(new Date(record.date), "yyyy-MM-dd")}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-primary">{record.team}</div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {Number(record.target).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {Number(record.newDepositShipOk).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={progress >= 80 ? "default" : "destructive"} className={progress >= 80 ? "bg-[hsl(var(--success))]" : ""}>
                            {progress.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog open={isEditOpen && editingRecord?.id === record.id} onOpenChange={(open) => {
                              setIsEditOpen(open);
                              if (!open) setEditingRecord(null);
                            }}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                                  onClick={() => setEditingRecord(record)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <KpiForm 
                                  initialData={record} 
                                  mode="edit" 
                                  onSuccess={() => setIsEditOpen(false)} 
                                />
                              </DialogContent>
                            </Dialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Record?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the KPI record for {record.team} on {record.date}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => handleDelete(record.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
