"use client";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { SessionProvider } from "next-auth/react";
import React, { ReactNode } from "react";
import { extractRouterConfig } from "uploadthing/server";


export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {/* UploadThing plugin is better handled here, 
          but ensure it's not wrapping your actual UI logic */}
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      {children}
    </SessionProvider>
  );
}