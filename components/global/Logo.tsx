import Link from "next/link";
import React from "react";
import Image from "next/image";

export default function Logo({
  variant = "light",
  href = "/",
}: {
  variant?: "dark" | "light";
  href?: string;
}) {
  // Common Image Component to keep code DRY (Don't Repeat Yourself)
  const LogoImage = (
    <Image
      src="/images/haelo-peptides-logo.webp"
      alt="Haelolabs Innovations Logo"
      width={100} // Increased size for better clarity
      height={100}
      className="rounded-md object-contain"
      priority // Ensures the logo loads immediately as it's a layout element
    />
  );

  return (
    <Link href={href} className="flex items-center space-x-2">
      {variant === "light" ? (
        <>
          {LogoImage}
          <span className="font-bold text-white">Haelolabs</span>
        </>
      ) : (
        <>
          {LogoImage}
          <span className="font-bold text-white">Haelolabs</span>
        </>
      )}
    </Link>
  );
}