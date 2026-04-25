// app/contact/page.tsx
import type { Metadata } from "next";
import { ContactClient } from "./contact-client";

export const metadata: Metadata = {
  title: "Contact Us | PeptideIron - Research Peptide Supplier",
  description: "Contact our research support team for inquiries about peptides, SARMs, research chemicals, bulk orders, and institutional accounts.",
};

export default function ContactPage() {
  return <ContactClient />;
}