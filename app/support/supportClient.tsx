"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageCircle, Send, ChevronDown, ChevronUp,
  Clock, CheckCircle2, Loader2, Phone, Mail,
  Package, Tag, ExternalLink, Ticket,
} from "lucide-react";
import { submitSupportTicket } from "@/actions/support";
import toast from "react-hot-toast";
import Link from "next/link";

// ── Replace with your actual WhatsApp number (international format, no +) ──
const WHATSAPP_NUMBER = "+254746358820";

const TICKET_TYPES = [
  { value: "OTHER",           label: "General Enquiry"   },
  { value: "BUG",             label: "Report a Problem"  },
  { value: "FEATURE_REQUEST", label: "Feature Request"   },
  { value: "IMPROVEMENT",     label: "Suggestion"        },
  { value: "THANKS",          label: "Feedback / Thanks" },
] as const;

const STATUS_CONFIG = {
  PENDING:     { label: "Pending",     color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-400",   bg: "bg-blue-500/10   border-blue-500/20"   },
  APPROVED:    { label: "Approved",    color: "text-green-400",  bg: "bg-green-500/10  border-green-500/20"  },
  COMPLETED:   { label: "Completed",   color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20"},
  REJECTED:    { label: "Rejected",    color: "text-red-400",    bg: "bg-red-500/10    border-red-500/20"    },
};

const FAQS = [
  {
    q: "How long does shipping take?",
    a: "Standard shipping takes 5–10 business days. Express shipping (2–3 days) is available at checkout. All orders include tracking.",
  },
  {
    q: "What is your return policy?",
    a: "We accept returns within 14 days of delivery for damaged or incorrect items. Products must be unopened and in original packaging.",
  },
  {
    q: "Are your products third-party tested?",
    a: "Yes. Every batch is tested by an independent ISO-certified laboratory for purity and potency. Certificates of Analysis are available on each product page.",
  },
  {
    q: "Can I change or cancel my order?",
    a: "Orders can be modified or cancelled within 2 hours of placement. After that, please contact support and we'll do our best to help.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order ships you'll receive a tracking email. You can also view live status in your account under Orders.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, and bank transfers for large orders. All payments are processed securely via Stripe.",
  },
];

export function SupportClient({
  user,
  tickets,
}: {
  user: any;
  tickets: any[];
}) {
  const searchParams  = useSearchParams();
  const productId     = searchParams.get("productId");
  const productName   = searchParams.get("productName");
  const productPrice  = searchParams.get("price");

  const [openFaq,    setOpenFaq]    = useState<number | null>(null);
  const [ticketType, setTicketType] = useState<typeof TICKET_TYPES[number]["value"]>("OTHER");
  const [title,      setTitle]      = useState(productName ? `Enquiry about ${productName}` : "");
  const [message,    setMessage]    = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Build WhatsApp message with product context if available
  const whatsappMessage = productName
    ? `Hi! I need help with a product I found on your store.\n\n*Product:* ${productName}${productPrice ? `\n*Price:* $${productPrice}` : ""}\n\nMy question:`
    : "Hi! I need help with something on Iron Peptides Innovation.";

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to submit a ticket");
      return;
    }
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    const res = await submitSupportTicket({
      type:    ticketType,
      title:   title.trim(),
      content: message.trim(),
    });
    if (res.success) {
      toast.success(`Ticket #${res.ticketId.slice(-6).toUpperCase()} submitted — we'll be in touch within 24 hours`);
      setTitle(productName ? `Enquiry about ${productName}` : "");
      setMessage("");
    } else {
      toast.error("Failed to submit ticket. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-16">

        {/* ── Header ── */}
        <div className="text-center space-y-3">
          <p className="text-xs text-emerald-500 uppercase tracking-widest font-bold">Support</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">How can we help?</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Chat with us on WhatsApp for instant replies, or submit a ticket and we'll respond within 24 hours.
          </p>
        </div>

        {/* ── Product context banner (shown when coming from a product page) ── */}
        {productName && (
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="bg-emerald-500/10 rounded-xl p-3 flex-shrink-0">
              <Package className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest mb-0.5">
                Asking about a product
              </p>
              <p className="text-sm font-medium text-white truncate">{productName}</p>
              {productPrice && (
                <p className="text-xs text-gray-400 mt-0.5">${productPrice}</p>
              )}
            </div>
            {productId && (
              <Link href={`/products/${productId}`}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors flex-shrink-0">
                View <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        )}

        {/* ── Contact options ── */}
        <div className="grid sm:grid-cols-2 gap-4">

          {/* WhatsApp — primary */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all"
          >
            <div className="bg-[#25D366]/10 rounded-xl p-3 flex-shrink-0 group-hover:bg-[#25D366]/20 transition-colors">
              <svg className="h-6 w-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">
                WhatsApp — Instant Reply
              </p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Chat directly with our team. Typical response in under 5 minutes during business hours.
              </p>
              <p className="text-xs text-emerald-500 font-medium mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Online now
              </p>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:support@ironpeptides.com"
            className="group flex items-start gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-blue-500/40 hover:bg-blue-500/5 transition-all"
          >
            <div className="bg-blue-500/10 rounded-xl p-3 flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
              <Mail className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white group-hover:text-blue-400 transition-colors">
                Email Support
              </p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Send us a detailed message and we'll respond within 24 hours on business days.
              </p>
              <p className="text-xs text-blue-400 font-medium mt-2">
                support@ironpeptides.com
              </p>
            </div>
          </a>
        </div>

        {/* ── Ticket form ── */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
            <Ticket className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-sm">Submit a Support Ticket</h2>
            {!user && (
              <span className="ml-auto text-xs text-gray-500">
                <Link href="/login?redirect=/support" className="text-blue-400 hover:underline">
                  Sign in
                </Link>{" "}
                to submit a ticket
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {TICKET_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTicketType(t.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      ticketType === t.value
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                Subject
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Question about BPC-157 dosage"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Describe your issue or question in detail..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none"
              />
              <p className="text-xs text-gray-600 text-right">{message.length} characters</p>
            </div>

            <button
              type="submit"
              disabled={submitting || !user}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                : <><Send className="h-4 w-4" /> Submit Ticket</>}
            </button>
          </form>
        </div>

        {/* ── My tickets ── */}
        {user && tickets.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" /> My Tickets
            </h2>
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const cfg = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
                return (
                  <div key={ticket.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-white truncate">{ticket.title}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ticket.content}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── FAQs ── */}
        <div className="space-y-4">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-gray-400" /> Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i}
                className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-white/[0.03] transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}