"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Pencil, X } from "lucide-react";
import {
  createCustomTopic,
  updateCustomTopic,
  deleteCustomTopic,
} from "@/actions/peptideTopicContent";

interface CustomTopic {
  id: string;
  topicKey: string;
  label: string;
  content: string;
  order: number;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
}

interface TopicDraft {
  topicKey: string;
  label: string;
  content: string;
  order: string;
  metaTitle: string;
  metaDescription: string;
  keywordsInput: string;
}

const EMPTY_DRAFT: TopicDraft = {
  topicKey: "",
  label: "",
  content: "",
  order: "0",
  metaTitle: "",
  metaDescription: "",
  keywordsInput: "",
};

function toDraft(t: CustomTopic): TopicDraft {
  return {
    topicKey: t.topicKey,
    label: t.label,
    content: t.content,
    order: String(t.order),
    metaTitle: t.metaTitle ?? "",
    metaDescription: t.metaDescription ?? "",
    keywordsInput: t.keywords.join(", "),
  };
}

export function PeptideCustomTopicsManager({
  peptideId,
  initialTopics,
}: {
  peptideId: string;
  initialTopics: CustomTopic[];
}) {
  const router = useRouter();
  const [topics, setTopics] = useState(initialTopics);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<TopicDraft>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startCreate() {
    setDraft(EMPTY_DRAFT);
    setEditingId("new");
    setError(null);
  }

  function startEdit(t: CustomTopic) {
    setDraft(toDraft(t));
    setEditingId(t.id);
    setError(null);
  }

  function cancel() {
    setEditingId(null);
    setError(null);
  }

  async function save() {
    setError(null);

    if (!draft.topicKey.trim() || !draft.label.trim() || !draft.content.trim()) {
      setError("Topic key, label, and content are required.");
      return;
    }

    setSaving(true);
    const keywords = draft.keywordsInput
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const payload = {
      peptideId,
      topicKey: draft.topicKey.trim(),
      label: draft.label.trim(),
      content: draft.content,
      order: Number(draft.order) || 0,
      metaTitle: draft.metaTitle || undefined,
      metaDescription: draft.metaDescription || undefined,
      keywords,
    };

    try {
      const result =
        editingId === "new"
          ? await createCustomTopic(payload)
          : await updateCustomTopic(editingId as string, payload);

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.refresh();
      // optimistic local update so the list reflects the change immediately
      if (result?.data) {
        setTopics((prev) => {
          const existingIdx = prev.findIndex((t) => t.id === result.data!.id);
          if (existingIdx >= 0) {
            const next = [...prev];
            next[existingIdx] = result.data as CustomTopic;
            return next;
          }
          return [...prev, result.data as CustomTopic];
        });
      }
      setEditingId(null);
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this topic page? This removes its live URL immediately.")) return;
    const result = await deleteCustomTopic(id);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setTopics((prev) => prev.filter((t) => t.id !== id));
    router.refresh();
  }

  return (
    <div className="border-t border-white/10 pt-6 mt-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-medium">Custom Topics</h3>
          <p className="text-xs text-gray-500">
            Adds a new page at /peptides/[slug]/[topics]
          </p>
        </div>
        {editingId === null && (
          <Button type="button" variant="outline" size="sm" onClick={startCreate}>
            <PlusCircle className="w-4 h-4 mr-1" /> Add Custom Topic
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-md p-3 mb-3">
          {error}
        </div>
      )}

      {/* Existing topics list */}
      <div className="space-y-2 mb-4">
        {topics.length === 0 && editingId === null && (
          <p className="text-sm text-gray-500">No custom topics yet.</p>
        )}
        {topics
          .filter((t) => t.id !== editingId)
          .sort((a, b) => a.order - b.order)
          .map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3"
            >
              <div>
                <p className="font-medium">{t.label}</p>
                <p className="text-xs text-gray-500">/peptides/.../{t.topicKey}</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(t)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
      </div>

      {/* Create / edit form */}
      {editingId !== null && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">
              {editingId === "new" ? "New Custom Topic" : "Edit Custom Topic"}
            </h4>
            <Button type="button" variant="ghost" size="sm" onClick={cancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">
                Topic Key <span className="text-gray-500">(URL slug)</span>
              </label>
              <Input
                value={draft.topicKey}
                onChange={(e) => setDraft({ ...draft, topicKey: e.target.value })}
                placeholder="purity-testing"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Label</label>
              <Input
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                placeholder="Purity Testing"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Content</label>
            <Textarea
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Meta Title (optional)</label>
              <Input
                value={draft.metaTitle}
                onChange={(e) => setDraft({ ...draft, metaTitle: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Tab Order</label>
              <Input
                type="number"
                value={draft.order}
                onChange={(e) => setDraft({ ...draft, order: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Meta Description (optional)</label>
            <Textarea
              value={draft.metaDescription}
              onChange={(e) => setDraft({ ...draft, metaDescription: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Keywords <span className="text-gray-500">(comma-separated)</span>
            </label>
            <Input
              value={draft.keywordsInput}
              onChange={(e) => setDraft({ ...draft, keywordsInput: e.target.value })}
              placeholder="purity testing, HPLC, mass spec verification"
            />
          </div>

          <Button type="button" onClick={save} disabled={saving}>
            {saving ? "Saving..." : editingId === "new" ? "Create Topic" : "Update Topic"}
          </Button>
        </div>
      )}
    </div>
  );
}