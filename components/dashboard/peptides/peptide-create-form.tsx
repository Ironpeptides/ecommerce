"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PeptideInfoForm } from "./peptide-info-form";

export function PeptideCreateForm() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create New Peptide Info</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Peptide Information Page</DialogTitle>
        </DialogHeader>
        <PeptideInfoForm editingId={null} />
      </DialogContent>
    </Dialog>
  );
}