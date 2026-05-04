// app/contact/contact-client.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { sendForm, type FormState } from "@/actions/contactUs";
import {
  Mail,
  Building2,
  ShieldCheck,
  Clock,
  MapPin,
  Globe,
  FileCheck,
  Truck,
  FlaskConical,
  AlertCircle,
  Send,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

// Type guard to check if error has field-specific errors
function hasFieldErrors(errors: FormState['errors']): errors is NonNullable<FormState['errors']> & {
  name?: string[];
  email?: string[];
  institution?: string[];
  subject?: string[];
  inquiryType?: string[];
  message?: string[];
} {
  return !!errors && !('_form' in errors);
}

export function ContactClient() {
  const formRef = useRef<HTMLFormElement>(null);
  const [formState, formAction] = useActionState<FormState, FormData>(sendForm, { message: "" });
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSubmissionState, setLastSubmissionState] = useState<string>("");

  // Use useEffect to handle side effects when formState changes
  useEffect(() => {
    // Only trigger success actions when we get a new success response
    if (formState.message === "success" && lastSubmissionState !== "success") {
      setLastSubmissionState("success");
      setShowSuccess(true);
      formRef.current?.reset();
      
      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    // Reset tracking when it's not success
    if (formState.message !== "success") {
      setLastSubmissionState("");
    }
  }, [formState.message, lastSubmissionState]);

  // Helper to get field error
  // Simpler approach - use optional chaining and type assertion
const getFieldError = (fieldName: keyof NonNullable<FormState['errors']>) => {
  const errors = formState.errors;
  if (!errors) return undefined;
  // Check if this is not the _form error type
  if (!('_form' in errors)) {
    return errors[fieldName as keyof typeof errors]?.[0];
  }
  return undefined;
};

const getFormError = () => {
  const errors = formState.errors;
  if (!errors) return undefined;
  // Check if this is the _form error type
  if ('_form' in errors) {
    return (errors as { _form: string[] })._form[0];
  }
  return undefined;
};

  if(showSuccess){
    toast.success("Message sent successfully! Our team will respond within 24 business hours.");
    setShowSuccess(false);
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-white/5 rounded-full px-4 py-1.5 mb-4">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            <span className="text-xs uppercase tracking-wider text-gray-400">Get in Touch</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 uppercase tracking-tight">
            Contact <span className="text-gray-400">Our Team</span>
          </h1>
          <p className="text-gray-400 leading-relaxed">
            For research inquiries, institutional accounts, or technical support—our team responds within 24 business hours.
          </p>
        </div>

        {/* Contact Methods Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="border border-white/10 rounded-xl p-6 bg-white/5 text-center hover:border-white/20 transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Email Us</h3>
            <p className="text-gray-400 text-sm mb-3">For general and research inquiries</p>
            <a href="mailto:research@PeptideIron.com" className="text-gray-300 text-sm hover:text-white transition-colors">
              research@PeptideIron.com
            </a>
            <p className="text-gray-500 text-xs mt-3">Response within 24 hours</p>
          </div>

          <div className="border border-white/10 rounded-xl p-6 bg-white/5 text-center hover:border-white/20 transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-6 w-6 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Bulk & Institutional</h3>
            <p className="text-gray-400 text-sm mb-3">For universities and pharmaceutical R&D</p>
            <a href="mailto:institutional@PeptideIron.com" className="text-gray-300 text-sm hover:text-white transition-colors">
              institutional@PeptideIron.com
            </a>
            <p className="text-gray-500 text-xs mt-3">Volume pricing available</p>
          </div>

          <div className="border border-white/10 rounded-xl p-6 bg-white/5 text-center hover:border-white/20 transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-6 w-6 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Compliance & Legal</h3>
            <p className="text-gray-400 text-sm mb-3">For regulatory and legal inquiries</p>
            <a href="mailto:compliance@PeptideIron.com" className="text-gray-300 text-sm hover:text-white transition-colors">
              compliance@PeptideIron.com
            </a>
            <p className="text-gray-500 text-xs mt-3">Confidential communication</p>
          </div>
        </div>

        {/* Two Column Layout: Form + Info */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="border border-white/10 rounded-xl bg-white/5 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-2">Send an Inquiry</h2>
              <p className="text-gray-400 text-sm mb-6">
                Please complete the form below. All fields are required.
              </p>

              {/* Success Message */}
              {showSuccess && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-green-500 font-medium">Message sent successfully!</p>
                    <p className="text-green-400/70 text-sm">Our team will respond within 24 business hours.</p>
                  </div>
                </div>
              )}

              {/* Global Error Message */}
              {getFormError() && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-500 text-sm">{getFormError()}</p>
                </div>
              )}

              <form ref={formRef} action={formAction} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                      Full Name <span className="text-gray-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-2 bg-black border border-white/10 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                      placeholder="Dr. Jane Smith"
                    />
                    {getFieldError('name') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('name')}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address <span className="text-gray-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-2 bg-black border border-white/10 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                      placeholder="jane.smith@university.edu"
                    />
                    {getFieldError('email') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('email')}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="institution" className="block text-sm font-medium text-gray-300 mb-1">
                      Institution / Laboratory
                    </label>
                    <input
                      type="text"
                      id="institution"
                      name="institution"
                      className="w-full px-4 py-2 bg-black border border-white/10 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                      placeholder="University of Example"
                    />
                    {getFieldError('institution') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('institution')}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-300 mb-1">
                      Inquiry Type <span className="text-gray-500">*</span>
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      required
                      defaultValue=""
                      className="w-full px-4 py-2 bg-black border border-white/10 rounded-md text-white focus:outline-none focus:border-gray-500 transition-colors"
                    >
                      <option value="" disabled>Select inquiry type</option>
                      <option value="general">General Research Inquiry</option>
                      <option value="bulk">Bulk / Wholesale Order</option>
                      <option value="technical">Technical Support</option>
                      <option value="compliance">Compliance Question</option>
                      <option value="institutional">Institutional Account</option>
                    </select>
                    {getFieldError('inquiryType') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('inquiryType')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                    Subject <span className="text-gray-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-2 bg-black border border-white/10 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                    placeholder="Inquiry regarding peptide purity specifications"
                  />
                  {getFieldError('subject') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('subject')}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                    Message <span className="text-gray-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="w-full px-4 py-2 bg-black border border-white/10 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors resize-none"
                    placeholder="Please provide details about your research needs, including compound names, quantities, and any specific purity requirements..."
                  />
                  {getFieldError('message') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('message')}</p>
                  )}
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-amber-400/70 text-xs">
                    By submitting this form, you confirm that all products will be used for legitimate laboratory research purposes only.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-2.5 bg-white text-black font-medium rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" /> Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Information Sidebar */}
          <div className="space-y-6">
            {/* Business Hours */}
            <div className="border border-white/10 rounded-xl p-6 bg-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-gray-400" />
                <h3 className="font-bold text-white">Business Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Monday - Friday</span>
                  <span className="text-white">09:00 - 18:00 EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Saturday</span>
                  <span className="text-white">10:00 - 15:00 EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sunday</span>
                  <span className="text-gray-500">Closed</span>
                </div>
              </div>
              <div className="border-t border-white/10 mt-4 pt-4 text-xs text-gray-500">
                <p>Support available 24/7 for urgent shipping inquiries.</p>
              </div>
            </div>

            {/* Warehouse / HQ */}
            <div className="border border-white/10 rounded-xl p-6 bg-white/5">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-gray-400" />
                <h3 className="font-bold text-white">Operations Center</h3>
              </div>
              <p className="text-gray-300 text-sm mb-1">PeptideIron LLC</p>
              <p className="text-gray-400 text-sm">123 Research Drive</p>
              <p className="text-gray-400 text-sm">Wilmington, DE 19801</p>
              <p className="text-gray-500 text-xs mt-3">By appointment only. No public retail.</p>
            </div>

            {/* Quick Links */}
            <div className="border border-white/10 rounded-xl p-6 bg-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-5 w-5 text-gray-400" />
                <h3 className="font-bold text-white">Quick Resources</h3>
              </div>
              <div className="space-y-2">
                <Link href="/legal/research-use-policy" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <FileCheck className="h-3.5 w-3.5" /> Research Use Policy
                </Link>
                <Link href="/legal/shipping-policy" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Truck className="h-3.5 w-3.5" /> Shipping & Import
                </Link>
                <Link href="/legal/quality-assurance" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <FlaskConical className="h-3.5 w-3.5" /> Quality Assurance
                </Link>
              </div>
            </div>

            {/* Emergency / Lab Safety */}
            <div className="border border-red-500/20 rounded-xl p-6 bg-red-500/5">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <h3 className="font-bold text-red-400 text-sm uppercase tracking-wider">Laboratory Emergency</h3>
              </div>
              <p className="text-gray-300 text-xs">
                For safety data sheets (SDS) or chemical exposure protocols, contact our 24/7 safety line:
              </p>
              <p className="text-white text-sm font-mono mt-2">+1 (800) 555-SAFE</p>
            </div>
          </div>
        </div>

        {/* Map / Facility Image Section */}
        <div className="mt-16">
          <div className="relative h-[280px] rounded-xl overflow-hidden border border-white/10">
            <Image
              src="/images/contact-map.jpg"
              alt="Map of facility locations or laboratory image"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-md px-3 py-1.5">
              <p className="text-gray-300 text-xs">📍 Main Distribution Center • Wilmington, DE</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-xs text-gray-500">
          <p>
            For media inquiries or partnership opportunities, please contact partnerships@[sitename].com
          </p>
          <p className="mt-2">
            All communication is subject to our <Link href="/legal/privacy-policy" className="underline hover:text-white">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}