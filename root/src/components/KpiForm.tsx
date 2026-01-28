import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertKpiSchema, type InsertKpiRecord } from "@shared/schema";
import { useCreateKpiRecord, useUpdateKpiRecord } from "@/hooks/use-kpi";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { z } from "zod";

interface KpiFormProps {
  initialData?: InsertKpiRecord & { id?: number };
  mode?: "create" | "edit";
  onSuccess?: () => void;
}

const TEAMS = ["OCENIA", "CYPRUS", "KENYA", "MOZAMBIQUE", "MALAWI", "JAMAICA", "BAHAMAS/GUYANA", "TRUCKS"];

// Helper to auto-calculate fields if needed, simplified here
export function KpiForm({ initialData, mode = "create", onSuccess }: KpiFormProps) {
  const createMutation = useCreateKpiRecord();
  const updateMutation = useUpdateKpiRecord();
  
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<InsertKpiRecord>({
    resolver: zodResolver(insertKpiSchema),
    defaultValues: initialData || {
      date: new Date().toISOString().split('T')[0],
      team: "",
      target: 0,
      ytdTarget: 0,
      qualifiedInquiries: 0,
      newRegister: 0,
      newDeposit: 0,
      newDepositShipOk: 0,
      strategic: 0,
      retention: 0,
      upsell: 0,
      notes: "",
    },
  });

  // Watch fields for potential calculations
  const values = form.watch();

  const onSubmit = async (data: InsertKpiRecord) => {
    try {
      if (mode === "edit" && initialData?.id) {
        await updateMutation.mutateAsync({ id: initialData.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
        form.reset();
      }
      onSuccess?.();
    } catch (error) {
      console.error(error);
    }
  };

  const saveDraft = () => {
    localStorage.setItem("kpi_draft", JSON.stringify(form.getValues()));
    alert("Draft saved to local storage!");
  };

  const loadDraft = () => {
    const draft = localStorage.getItem("kpi_draft");
    if (draft) {
      form.reset(JSON.parse(draft));
    }
  };

  return (
    <Card className="w-full border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle>{mode === "create" ? "New KPI Record" : "Edit Record"}</CardTitle>
        <CardDescription>Enter the sales performance data for the selected period.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Metadata</h3>
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="h-11 rounded-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="team"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-lg">
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TEAMS.map(team => (
                            <SelectItem key={team} value={team}>{team}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="target"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Target</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            className="h-11 rounded-lg font-mono"
                            onChange={e => field.onChange(parseFloat(e.target.value))} 
                          />
                        </FormControl>
                        <FormDescription className="text-[10px]">Monthly units goal</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ytdTarget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Year Target</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            className="h-11 rounded-lg font-mono"
                            onChange={e => field.onChange(parseFloat(e.target.value))} 
                          />
                        </FormControl>
                        <FormDescription className="text-[10px]">Annual units goal</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Funnel Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="qualifiedInquiries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualified Inq.</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="rounded-lg font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newRegister"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Register</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="rounded-lg font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="p-4 bg-muted/30 rounded-xl border border-border/50 space-y-4">
                  <FormField
                    control={form.control}
                    name="newDepositShipOk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-bold">New Deposit Ship OK</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="rounded-lg font-mono border-primary/20 bg-background" />
                        </FormControl>
                        <FormDescription>Primary KPI metric</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                     <FormField
                      control={form.control}
                      name="strategic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Strategic</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="rounded-lg font-mono" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="retention"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Retention</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="rounded-lg font-mono" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="upsell"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upsell</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="rounded-lg font-mono" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional context regarding this record..." 
                      className="resize-none min-h-[100px] rounded-lg"
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex gap-2">
                 <Button type="button" variant="ghost" onClick={loadDraft} title="Load Draft">
                  <RotateCcw className="w-4 h-4 mr-2" /> Load
                </Button>
                <Button type="button" variant="outline" onClick={saveDraft}>
                  Save Draft
                </Button>
              </div>
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 min-w-[150px]">
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {mode === "create" ? "Submit Record" : "Update Record"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
