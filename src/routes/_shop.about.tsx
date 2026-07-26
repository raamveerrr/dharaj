import { createFileRoute } from "@tanstack/react-router";
import { Leaf, ShieldCheck, Sprout, Sun, HeartHandshake, Mail } from "lucide-react";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";

export const Route = createFileRoute("/_shop/about")({
  head: () => ({
    meta: [
      { title: "About Dharaj — Pure, Handmade, Traditional" },
      { name: "description", content: "Our promise: 100% natural, no pesticides, no chemicals, handmade with love." },
      { property: "og:title", content: "About Dharaj — Pure, Handmade, Traditional" },
      { property: "og:description", content: "Rooted in tradition. Grown with care." },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  { i: Leaf, t: "100% Natural", d: "Nothing artificial, nothing hidden." },
  { i: Sprout, t: "No Pesticides", d: "Sourced from certified organic farms." },
  { i: Sun, t: "No Chemicals", d: "Sun-dried and cold-pressed traditions." },
  { i: HeartHandshake, t: "Handmade", d: "Small batches, real hands, real care." },
  { i: ShieldCheck, t: "Lab Tested", d: "Every batch verified for purity." },
];

function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Our Story
          </span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">
            Rooted in tradition. Grown with care.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Dharaj began in a small village kitchen with a simple promise — bring back the pure,
            wholesome taste of the food our grandmothers made. Every jar of ghee, pickle and spice
            we send you carries that same care.
          </p>
        </div>
        <ImagePlaceholder className="aspect-[4/3]" rounded="rounded-3xl" label="Our farm" />
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-extrabold">Our Promise</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {pillars.map(({ i: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div className="mt-3 text-sm font-bold">{t}</div>
              <p className="text-xs text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-3xl bg-primary p-8 text-primary-foreground sm:p-12">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["50+", "Organic Farms"],
            ["10k+", "Happy Homes"],
            ["100%", "Natural Products"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="text-4xl font-extrabold">{n}</div>
              <div className="text-sm opacity-80">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-extrabold">Get in touch</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Questions, feedback, or bulk enquiries — we'd love to hear from you.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-primary" /> hello@dharaj.in
          </div>
        </div>
        <form className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="grid gap-3">
            <input placeholder="Your name" className="rounded-xl border border-border bg-secondary/50 px-3 py-2.5 text-sm outline-none" />
            <input placeholder="Email" className="rounded-xl border border-border bg-secondary/50 px-3 py-2.5 text-sm outline-none" />
            <textarea placeholder="Message" rows={4} className="rounded-xl border border-border bg-secondary/50 px-3 py-2.5 text-sm outline-none" />
            <button type="button" className="rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary-hover">
              Send Message
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
