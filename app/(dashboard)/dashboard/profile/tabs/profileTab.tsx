"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Loader2, User } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { UploadButton } from "@/lib/uploadthing";
import { updateProfile } from "@/actions/profile";

export function ProfileTab({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: user.firstName ?? "",
    lastName:  user.lastName  ?? "",
    phone:     user.phone     ?? "",
    jobTitle:  user.jobTitle  ?? "",
    address:   user.address   ?? "",
    image:     user.image     ?? "",
  });

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  const save = async () => {
    setLoading(true);
    const res = await updateProfile(user.id, form);
    if (res.success) toast.success("Profile saved");
    else toast.error(res.error ?? "Something went wrong");
    setLoading(false);
  };

  return (
    <div className="space-y-8">

      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center flex-shrink-0">
          {form.image ? (
            <Image src={form.image} alt="Avatar" fill className="object-cover" />
          ) : (
            <User className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <p className="font-semibold">{user.name}</p>
            {user.isVerified && (
              <Badge variant="secondary" className="text-xs">Verified</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>

          {/* UploadThing button — styled to blend in */}
          <UploadButton
            endpoint="profileImage" 
            content={{
              button: "Change Photo",
              allowedContent: "Image (max 4MB)",
            }}
            appearance={{
              button:
                "ut-ready:bg-primary ut-ready:text-primary-foreground ut-uploading:bg-primary/80 text-xs px-3 py-1.5 h-auto rounded-md font-medium focus-within:ring-2 focus-within:ring-ring",
              allowedContent: "text-xs text-muted-foreground mt-1",
            }}
            onClientUploadComplete={(res) => {
              setForm((p) => ({ ...p, image: res[0].url }));
              toast.success("Photo updated — save to apply");
            }}
            onUploadError={(error: Error) => {
              toast.error(`Upload failed: ${error.message}`);
            }}
          />
        </div>
      </div>

      <Separator />

      {/* Form */}
      <div className="space-y-5">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>First Name</Label>
            <Input placeholder="John" value={form.firstName} onChange={set("firstName")} />
          </div>
          <div className="space-y-1.5">
            <Label>Last Name</Label>
            <Input placeholder="Doe" value={form.lastName} onChange={set("lastName")} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input placeholder="+1 (555) 000-0000" value={form.phone} onChange={set("phone")} />
          </div>
          <div className="space-y-1.5">
            <Label>Job Title</Label>
            <Input placeholder="e.g. Marketing Manager" value={form.jobTitle} onChange={set("jobTitle")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Address</Label>
            <Input placeholder="123 Main St, City, Country" value={form.address} onChange={set("address")} />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={save} disabled={loading} className="gap-2 min-w-[120px]">
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}