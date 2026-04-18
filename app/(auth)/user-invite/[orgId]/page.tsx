"use client";

import RegisterForm from "@/components/Forms/RegisterForm";
import RegisterInvitedUserForm from "@/components/Forms/RegisterInvitedUserForm";

import { GridBackground } from "@/components/reusable-ui/grid-background";
import { resolveCname } from "node:dns";
import React from "react";

export default async function Page({params,searchParams}:{params: Promise<{orgId:string}>,
searchParams: Promise<{[key:string]: string | string[] | undefined}>}) {
  const {orgId} =  await params;
  const email = (await searchParams).email as string;
  const roleId = (await searchParams).roleId as string;
  const orgName = (await searchParams).orgName as string;
  return (
    <GridBackground>
      <div className="px-4 bg-zinc-950">
        <RegisterInvitedUserForm userEmail={email} orgId={orgId} orgName={orgName} roleId={roleId} />
      </div>
    </GridBackground>
  );
}
