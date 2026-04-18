"use client";
import { sendInvite } from "@/actions/users";
import FormSelectInput from "@/components/FormInputs/FormSelectInput";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AuthenticatedUser } from "@/config/useAuth";
import { Loader2, Plus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {toast} from "sonner";

export type InviteData = {
  email: string;
  orgId: string;
  orgName: string;
  roleId: string;
  roleName?: string;
  userFirstname?: string;
  invitedBy?: string;
};

export function UserInvitationForm({
  roles,
  orgId,
  orgName,
  currentUser, // pass the logged-in user here
}: {
  roles: { label: string; value: string }[];
  orgId: string;
  orgName: string;
  currentUser?: AuthenticatedUser; // e.g. { name: "John Doe", email: "john@example.com" }
}) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(roles[0]);
  const router = useRouter();

  const sendInvitation = async () => {
    if (!email.trim()) {
      setErr("Email is required");
      return;
    }
    setErr("");
    setLoading(true);

    const data: InviteData = {
      email,
      orgId,
      orgName,
      roleId: selectedRole.value as string,
      roleName: selectedRole.label as string,
      userFirstname: firstName.trim() || undefined,
      invitedBy: currentUser?.name ?? currentUser?.email ?? undefined,
    };

    console.log(data);
    try {
      const res = await sendInvite(data);
      console.log(res);
      if (res.status !== 200) {
        setLoading(false);
        toast.error(res.error);
        setErr(res.error || "Failed to send invitation");
        return
      }
      setLoading(false)
      toast.success("Invite Sent Successfully")
    } catch (error) {
      setLoading(false);
      toast.error("Failed to send invitation");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <UserPlus className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Invite User
          </span>
          <span className="md:sr-only">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle />
        </DialogHeader>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Invite New User</CardTitle>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <div className="flex flex-col w-full gap-2">
              <Input
                type="text"
                placeholder="First Name (optional)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendInvitation()}
              />
              <Input
                type="email"
                placeholder="example-user@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendInvitation()}
              />
              {err && <p className="text-red-500 -mt-1 text-sm">{err}</p>}
              <FormSelectInput
                label="Role"
                options={roles}
                option={selectedRole}
                setOption={setSelectedRole}
              />
              {loading ? (
                <Button disabled>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Sending invite...
                </Button>
              ) : (
                <Button onClick={sendInvitation}>
                  <Plus className="mr-2 h-4 w-4" /> Invite User
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}