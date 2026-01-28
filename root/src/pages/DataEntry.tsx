import { Sidebar } from "@/components/Sidebar";
import { KpiForm } from "@/components/KpiForm";
import { useToast } from "@/hooks/use-toast";

export default function DataEntry() {
  const { toast } = useToast();

  const handleSuccess = () => {
    // Optional additional logic
    console.log("Form submitted successfully");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-display font-bold text-foreground">Data Entry</h1>
            <p className="text-muted-foreground">Add new performance records manually. Ensure accuracy before saving.</p>
          </div>
          
          <KpiForm onSuccess={handleSuccess} />
        </div>
      </main>
    </div>
  );
}
