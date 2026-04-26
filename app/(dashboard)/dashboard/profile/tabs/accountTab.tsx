"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Loader2, Eye, EyeOff, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateEmail, updatePassword, deleteAccount } from "@/actions/profile";

export function AccountTab({ user }: { user: any }) {
  const router = useRouter();

  // Email state
  const [newEmail, setNewEmail] = useState(user.email);
  const [emailLoading, setEmailLoading] = useState(false);

  // Password state
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleEmailUpdate = async () => {
    if (!newEmail || newEmail === user.email) return;
    setEmailLoading(true);
    const res = await updateEmail(user.id, newEmail);
    if (res.success) {
      toast.success("Email updated — please sign in again");
      await signOut({ callbackUrl: "/login" });
    } else {
      toast.error(res.error ?? "Failed to update email");
    }
    setEmailLoading(false);
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in both fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setPasswordLoading(true);
    const res = await updatePassword(user.id, currentPassword, newPassword);
    if (res.success) {
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      toast.error(res.error ?? "Failed to update password");
    }
    setPasswordLoading(false);
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    const res = await deleteAccount(user.id);
    if (res.success) {
      await signOut({ callbackUrl: "/" });
    } else {
      toast.error(res.error ?? "Failed to delete account");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-10">

      {/* Email */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Email Address</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Updating your email will require you to sign in again.
          </p>
        </div>
        <div className="flex gap-3 max-w-md">
          <Input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleEmailUpdate}
            disabled={emailLoading || newEmail === user.email}
            className="shrink-0"
          >
            {emailLoading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : "Update"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Password */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Change Password</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Use a strong password of at least 8 characters.
          </p>
        </div>
        <div className="space-y-3 max-w-md">
          <div className="space-y-1.5">
            <Label>Current Password</Label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button
            onClick={handlePasswordUpdate}
            disabled={passwordLoading}
            className="gap-2"
          >
            {passwordLoading
              ? <><Loader2 className="h-4 w-4 animate-spin" />Updating...</>
              : "Update Password"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Danger zone */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          <h3 className="font-semibold text-destructive">Danger Zone</h3>
        </div>
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 space-y-3">
          <div>
            <p className="font-medium text-sm">Delete Account</p>
            <p className="text-xs text-muted-foreground mt-1">
              Permanently deletes your account, all data, and cancels any active subscriptions.
              This cannot be undone.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Delete My Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3">
                    <p>
                      This will permanently delete your account and all associated data.
                      Your active subscription will be cancelled immediately.
                    </p>
                    <p className="font-medium text-foreground">
                      Type <span className="font-mono text-destructive">DELETE</span> to confirm:
                    </p>
                    <Input
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="DELETE"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmText("")}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={confirmText !== "DELETE" || deleteLoading}
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                >
                  {deleteLoading
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Deleting...</>
                    : "Permanently Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}