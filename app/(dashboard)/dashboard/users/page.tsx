import TableHeader from "@/components/dashboard/Tables/TableHeader";
import { columns } from "./columns";
import { inviteColumns } from "./invitesColumns/columns";
import { buyerColumns } from "./buyersColumns/columns";
import { InvitesTable } from "@/components/dashboard/Tables/InvitesTable";
import { BuyersTable } from "@/components/dashboard/Tables/BuyersTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrgUsers, getOrgInvites, getOrgBuyers } from "@/actions/users";
import ModalTableHeader from "@/components/dashboard/Tables/ModalTableHeader";
import { UserInvitationForm } from "@/components/Forms/users/UserInvitationForm";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getRoles } from "@/actions/roles";
import DataTable from "@/components/DataTableComponents/DataTable";

const TABS = ["users", "invites", "buyers"] as const;

export default async function page() {
  const user = await getAuthenticatedUser();
  const res = await getRoles();
  const rolesData = res?.data || [];
  const roles = rolesData.map((role: any) => ({
    value: role.id,
    label: role.displayName,
  }));

  const orgId = user.orgId;
  const orgName = user?.orgName ?? "";
  const currentUser = user;

  const [users, invites, buyers] = await Promise.all([
  getOrgUsers(orgId).then((res) => res || []),
  getOrgInvites(orgId).then((res) => res || []),
  getOrgBuyers(orgId).then((res) => res || []),
]);

  return (
    <div className="p-8">
      <Tabs defaultValue="users" className="space-y-8">
        <TabsList className="inline-flex h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0 flex-wrap">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="inline-flex items-center gap-2 border-b-2 border-transparent px-8 pb-3 pt-2 data-[state=active]:border-primary capitalize"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Users ── */}
        <TabsContent value="users" className="space-y-8">
          <ModalTableHeader
            title="Users"
            linkTitle="Add User"
            href="/dashboard/users/new"
            data={users}
            model="user"
            modalForm={
              <UserInvitationForm
                roles={roles}
                orgId={orgId}
                orgName={orgName}
                currentUser={currentUser}
              />
            }
          />
          <DataTable columns={columns} data={users} />
        </TabsContent>

        {/* ── Invites ── */}
        <TabsContent value="invites" className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Invites</h2>
              <p className="text-muted-foreground text-sm">
                Track all pending and accepted invitations for your organisation.
              </p>
            </div>
          </div>
          <InvitesTable columns={inviteColumns} data={invites ?? []} />
        </TabsContent>

        {/* ── Buyers ── */}
        <TabsContent value="buyers" className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Buyers</h2>
              <p className="text-muted-foreground text-sm">
                All customers who have made purchases in your organisation.
              </p>
            </div>
          </div>
          <BuyersTable columns={buyerColumns} data={buyers ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}