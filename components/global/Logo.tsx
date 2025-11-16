import Link from "next/link";
import React from "react";
import HubStackLogo from "./kit-logo";
import VilyoIncLogo from "./VilyoLogo";

export default function Logo({
  variant = "light",
  href = "/",
}: {
  variant?: "dark" | "light";
  href?: string;
}) {
  if (variant === "light") {
    return (
      <Link href={href} className="flex items-center space-x-2">
        {/* <HubStackLogo width={200} height={60} /> */}
        <VilyoIncLogo />
      </Link>
    );
  } else {
    return (
      <Link href={"/"} className="flex items-center space-x-2">
        {/* <HubStackLogo width={200} height={60} theme="dark" /> */}
        <VilyoIncLogo />
      </Link>
    );
  }
}
