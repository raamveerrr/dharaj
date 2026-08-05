import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Building2, Truck, Store, Gift, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { EnquiryService, sendEnquiryEmails } from "@/services/enquiryService";
import { ENQUIRY_TYPES, type EnquiryType } from "@/types/enquiry";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shop/business-enquiry")({
  head: () => ({
    meta: [
      { title: "Partner With DHARAJ — Wholesale & Business Enquiry" },
      {
        name: "description",
        content:
          "Wholesale, distribution, retail, bulk orders and corporate gifting enquiries for DHARAJ organic foods.",
      },
      { property: "og:title", content: "Partner With DHARAJ" },
      {
        property: "og:description",
        content: "Wholesale, distributor, retail and bulk order partnerships with DHARAJ.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BusinessEnquiryPage,
});

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  state: string;
  enquiryType: EnquiryType | "";
  message: string;
};

const empty: FormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  city: "",
  state: "",
  enquiryType: "",
  message: "",
};

const perks = [
  { i: Truck, t: "Distribution", d: "State & city level partnerships" },
  { i: Store, t: "Retail", d: "Shelf-ready organic range" },
  { i: Building2, t: "Wholesale", d: "Bulk pricing on every category" },
  { i: Gift, t: "Corporate Gifting", d: "Custom festive hampers" },
  { i: UtensilsCrossed, t: "Restaurants & Cafés", d: "Consistent kitchen supply" },
];

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

function BusinessEnquiryPage() {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Name is required.";
    else if (form.name.trim().length > 100) next.name = "Name is too long.";

    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next.email = "Enter a valid email address.";

    const digits = form.phone.replace(/\D/g, "");
    if (!form.phone.trim()) next.phone = "Phone number is required.";
    else if (digits.length < 10 || digits.length > 15) next.phone = "Enter a valid phone number.";

    if (!form.enquiryType) next.enquiryType = "Select an enquiry type.";

    if (!form.message.trim()) next.message = "Message is required.";
    else if (form.message.trim().length > 2000) next.message = "Message is too long.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        city: form.city,
        state: form.state,
        enquiryType: form.enquiryType as EnquiryType,
        message: form.message,
      };
      await EnquiryService.createEnquiry(payload);
      void sendEnquiryEmails(payload);
      setForm(empty);
      setSuccess(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not submit your enquiry. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          Business Enquiry
        </span>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl">Partner With DHARAJ</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Interested in wholesale, retail, distribution, bulk orders or business partnerships? Fill
          out the form below and our team will contact you shortly.
        </p>
      </motion.section>

      <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {perks.map(({ i: Icon, t, d }, idx) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, delay: idx * 0.06 }}
            className="rounded-2xl border border-border bg-card p-4 shadow-card"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div className="mt-3 text-sm font-bold">{t}</div>
            <p className="text-xs text-muted-foreground">{d}</p>
          </motion.div>
        ))}
      </section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="mt-10 rounded-3xl border border-border bg-card p-5 shadow-card sm:p-8"
      >
        {success ? (
          <div className="py-10 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h2 className="mt-4 text-2xl font-extrabold">✅ Thank you!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your enquiry has been received successfully.
            </p>
            <p className="text-sm text-muted-foreground">
              Our DHARAJ team will contact you shortly.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              Send another enquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required error={errors.name}>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Your full name"
                maxLength={100}
              />
            </Field>
            <Field label="Email" required error={errors.email}>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@company.com"
                maxLength={255}
              />
            </Field>
            <Field label="Phone Number" required error={errors.phone}>
              <input
                type="tel"
                className={inputClass}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 98765 43210"
                maxLength={20}
              />
            </Field>
            <Field label="Company / Business Name">
              <input
                className={inputClass}
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="Business name"
                maxLength={150}
              />
            </Field>
            <Field label="City">
              <input
                className={inputClass}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="City"
                maxLength={100}
              />
            </Field>
            <Field label="State">
              <input
                className={inputClass}
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
                placeholder="State"
                maxLength={100}
              />
            </Field>
            <Field label="Enquiry Type" required error={errors.enquiryType}>
              <select
                className={inputClass}
                value={form.enquiryType}
                onChange={(e) => set("enquiryType", e.target.value)}
              >
                <option value="">Select enquiry type</option>
                {ENQUIRY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Message" required error={errors.message}>
                <textarea
                  rows={5}
                  className={cn(inputClass, "resize-y")}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="Tell us about your requirement, quantities and location…"
                  maxLength={2000}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Sending…" : "Send Enquiry"}
              </button>
            </div>
          </form>
        )}
      </motion.section>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
