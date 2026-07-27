"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2 } from "lucide-react";
import { createPeptideInfo, updatePeptideInfo } from "@/actions/peptideInfo";
import { useRouter } from "next/navigation";

const peptideSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  overview: z.string().min(1, "Overview is required"),
  mechanismOfAction: z.string().optional(),
  researchHighlights: z.string().optional(),
  dosageGuidance: z.string().optional(),
  safetyHandling: z.string().optional(),
  comparisons: z.string().optional(),
  productSlug: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .optional(),
});

type PeptideFormData = z.infer<typeof peptideSchema>;

interface Props {
  initialData?: PeptideFormData & { id?: string } | null;
  editingId?: string | null;
}

export function PeptideInfoForm({ initialData, editingId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<PeptideFormData>({
    resolver: zodResolver(peptideSchema),
    defaultValues: initialData ?? {
      name: "",
      slug: "",
      overview: "",
      mechanismOfAction: "",
      researchHighlights: "",
      dosageGuidance: "",
      safetyHandling: "",
      comparisons: "",
      productSlug: "",
      metaTitle: "",
      metaDescription: "",
      faq: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faq",
  });

  async function onSubmit(values: PeptideFormData) {
    setLoading(true);
    try {
      if (editingId) {
        await updatePeptideInfo(editingId, values);
      } else {
        await createPeptideInfo(values);
      }
      router.push("/dashboard/peptides");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">
        {editingId ? "Edit Peptide Info" : "Create Peptide Info"}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input {...form.register("name")} placeholder="BPC-157" />
          {form.formState.errors.name && (
            <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <Input {...form.register("slug")} placeholder="bpc-157" />
          {form.formState.errors.slug && (
            <p className="text-red-500 text-sm">{form.formState.errors.slug.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Overview</label>
        <Textarea {...form.register("overview")} rows={5} />
        {form.formState.errors.overview && (
          <p className="text-red-500 text-sm">{form.formState.errors.overview.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mechanism of Action</label>
          <Textarea {...form.register("mechanismOfAction")} rows={4} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Research Highlights</label>
          <Textarea {...form.register("researchHighlights")} rows={4} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Dosage Guidance</label>
          <Textarea {...form.register("dosageGuidance")} rows={4} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Safety & Handling</label>
          <Textarea {...form.register("safetyHandling")} rows={4} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Comparisons</label>
        <Textarea {...form.register("comparisons")} rows={4} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Slug</label>
          <Input {...form.register("productSlug")} placeholder="tirzepatide-10" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Meta Title</label>
          <Input {...form.register("metaTitle")} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Meta Description</label>
        <Textarea {...form.register("metaDescription")} rows={2} />
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">FAQ</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ question: "", answer: "" })}
          >
            <PlusCircle className="w-4 h-4 mr-1" /> Add Question
          </Button>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2 mb-3">
            <div className="flex-1">
              <Input
                {...form.register(`faq.${index}.question`)}
                placeholder="Question"
                className="mb-1"
              />
              <Textarea
                {...form.register(`faq.${index}.answer`)}
                rows={2}
                placeholder="Answer"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : editingId ? "Update" : "Create"}
      </Button>
    </form>
  );
}