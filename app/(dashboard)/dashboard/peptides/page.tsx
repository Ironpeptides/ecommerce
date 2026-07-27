import { getAllPeptideInfos } from "@/actions/peptideInfo";
import { columns } from "./columns";
import DataTable from "@/components/DataTableComponents/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PeptideCreateForm } from "@/components/dashboard/peptides/peptide-create-form";

export default async function AdminPeptidesPage() {
  const peptides = (await getAllPeptideInfos()) || [];

  return (
    <div className="p-8">
      <Tabs defaultValue="peptides" className="space-y-8">
        <TabsList className="inline-flex h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0 flex-wrap">
          <TabsTrigger
            value="peptides"
            className="inline-flex items-center gap-2 border-b-2 border-transparent px-8 pb-3 pt-2 data-[state=active]:border-primary capitalize"
          >
            Peptide Info Pages
          </TabsTrigger>
        </TabsList>
        <TabsContent value="peptides" className="space-y-8">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 py-3">
            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0">
              All Peptide Pages ({peptides.length})
            </h2>
            <div className="ml-auto flex items-center gap-2">
              <PeptideCreateForm />
            </div>
          </div>
          <div className="py-8">
            <DataTable data={peptides} columns={columns} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}