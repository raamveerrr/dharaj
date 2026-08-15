import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Leaf, ShieldCheck, Sprout, Sun, HeartHandshake, Mail } from "lucide-react";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";

export const Route = createFileRoute("/_shop/about")({
  head: () => ({
    meta: [
      { title: "About Dharaj — Rooted in What Matters" },
      {
        name: "description",
        content:
          "Dharaj began with a simple belief: the best food does not need to be complicated. It needs to be honest.",
      },
      { property: "og:title", content: "About Dharaj — Rooted in What Matters" },
      {
        property: "og:description",
        content:
          "Rooted in tradition and inspired by the richness of India's food heritage.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

function Lead({ children }: { children: React.ReactNode }) {
  return <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{children}</p>;
}

function Para({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{children}</p>;
}

function Strong({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-sm font-semibold leading-relaxed text-foreground sm:text-base">{children}</p>;
}

function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <motion.section
        {...fadeUp}
        viewport={{ once: true, amount: 0.2 }}
        className="grid gap-8 md:grid-cols-2 md:items-center"
      >
        <div>
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Our Story
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">
            Rooted in tradition. Made for today.
          </h1>
          <Lead>
            Some tastes stay with us. The crackle of spices hitting hot oil. The warm, nutty aroma of
            ghee slowly cooking. The tang of a pickle jar opened after days in the sun. The sweet,
            buttery aroma of cookies baking, drifting through the house.
          </Lead>
          <Strong>
            These are more than flavours. They are memories — of kitchens, people and recipes passed
            down through generations.
          </Strong>
          <Strong>
            Dharaj began with a simple belief: the best food does not need to be complicated. It
            needs to be honest.
          </Strong>
        </div>
        <ImagePlaceholder className="aspect-[4/3]" rounded="rounded-3xl" label="Our farm" />
      </motion.section>

      {/* Intro continued */}
      <motion.section {...fadeUp} className="mt-12 max-w-3xl">
        <Para>
          At a time when so much of what we eat is shaped by convenience, longer shelf life and
          faster consumption, we wanted to hold on to something simpler — food where the ingredient
          still matters, traditional ways of making it still have a place, and what goes into our
          everyday food deserves as much attention as how it tastes.
        </Para>
        <Para>
          Rooted in tradition and inspired by the richness of India's food heritage, Dharaj brings
          together a thoughtfully chosen range of everyday favourites — from cookies and traditional
          snacks to spices, pickles, ghee and cold-pressed oils.
        </Para>
        <Strong>We go back to the roots to bring those familiar flavours forward.</Strong>
      </motion.section>

      {/* Section: The taste of where we come from */}
      <motion.section
        {...fadeUp}
        className="mt-16 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-10"
      >
        <h2 className="text-2xl font-extrabold sm:text-3xl">The taste of where we come from</h2>
        <Para>
          For generations, Indian kitchens have known that good food begins long before it reaches
          the plate.
        </Para>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            "It begins with the soil.",
            "With the ingredient.",
            "With the way it is grown, chosen and prepared.",
          ].map((line, i) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl bg-secondary/50 p-4 text-sm font-medium"
            >
              {line}
            </motion.div>
          ))}
        </div>
        <Para>And with the patience to let traditional methods do their work.</Para>
        <Para>That wisdom is at the heart of Dharaj.</Para>
        <Para>
          Our relationship with food is changing too. We are paying more attention to ingredients,
          processing and the everyday choices we make for ourselves and our families. We believe
          this is a good thing.
        </Para>
        <Para>
          It doesn't mean giving up the foods we love. It means knowing what goes into them, making
          better choices where we can, and finding a balance between{" "}
          <span className="font-semibold text-foreground">
            taste, nourishment and enjoyment.
          </span>
        </Para>
        <Strong>
          For us, purity starts with the ingredient — choosing it well, respecting its natural
          goodness and preserving what makes it special.
        </Strong>
        <Para>
          Our spices are chosen for their character and aroma. Our pickles draw from familiar
          regional traditions. Our ghee and oils are made with care. And our cookies and baked
          offerings bring the warmth of familiar flavours into a more contemporary everyday
          experience.
        </Para>
        <Para>Different products, one philosophy:</Para>
        <p className="mt-3 rounded-2xl bg-primary/10 px-5 py-4 text-center text-base font-extrabold text-primary sm:text-lg">
          Keep it real. Keep it honest. Keep the goodness of the original.
        </p>
      </motion.section>

      {/* Section: Keeping the familiar */}
      <motion.section
        {...fadeUp}
        className="mt-16 grid gap-8 md:grid-cols-2 md:items-center"
      >
        <ImagePlaceholder className="aspect-[4/3]" rounded="rounded-3xl" label="Traditional kitchen" />
        <div>
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Keeping the familiar, making it our own
          </h2>
          <Para>
            Dharaj is inspired by the food we grew up with, but made for the way we live today.
          </Para>
          <Para>
            We bring together traditional flavours and methods with the quality, consistency and
            attention to detail that today's customers value. The aim is simple — to make food that
            fits naturally into modern life without losing what made it special in the first place.
          </Para>
          <Para>
            Whether Dharaj finds its way into an Indian home or onto a kitchen shelf halfway across
            the world, we want it to carry something with it — the taste of where it comes from, the
            comfort of something familiar and the confidence that it has been made with thought and
            purpose.
          </Para>
          <Para>
            Because nostalgia may begin with a memory, but food has a wonderful way of creating new
            ones.
          </Para>
        </div>
      </motion.section>

      {/* Our Promise pillars */}
      <motion.section {...fadeUp} className="mt-16">
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
      </motion.section>

      {/* Promise narrative */}
      <motion.section
        {...fadeUp}
        className="mt-16 rounded-3xl bg-primary p-8 text-primary-foreground sm:p-12"
      >
        <h2 className="text-2xl font-extrabold sm:text-3xl">Our Promise</h2>
        <p className="mt-4 text-sm leading-relaxed opacity-90 sm:text-base">
          We believe customers deserve to know and trust what they bring home. But our promise goes
          beyond any one product.
        </p>
        <p className="mt-4 text-sm leading-relaxed opacity-90 sm:text-base">
          We want to be part of a better way of enjoying everyday food — one that brings together{" "}
          <span className="font-bold">
            taste, nourishment, authenticity and trust.
          </span>
        </p>
        <p className="mt-4 text-sm leading-relaxed opacity-90 sm:text-base">
          That means making considered choices about ingredients and processes, keeping unnecessary
          additions to a minimum, and respecting the traditions and people behind the food we
          create.
        </p>
        <p className="mt-4 text-sm leading-relaxed opacity-90 sm:text-base">
          It also means looking beyond today — supporting responsible practices, valuing the
          communities we work with, and helping preserve food traditions that deserve to be carried
          forward.
        </p>
        <p className="mt-4 text-sm leading-relaxed opacity-90 sm:text-base">
          As Dharaj grows, we want to grow with purpose: creating food that people enjoy, choices
          they feel good about, and a brand that can earn its place in kitchens here and around the
          world.
        </p>
        <div className="mt-8 space-y-3 border-l-2 border-primary-foreground/40 pl-5">
          <p className="text-base font-bold sm:text-lg">
            The flavours we remember. The goodness we value. Made with care for the way we eat
            today.
          </p>
          <p className="text-lg font-extrabold sm:text-xl">Dharaj. Rooted in what matters.</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
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
      </motion.section>

      {/* Get in touch */}
      <motion.section {...fadeUp} className="mt-16 grid gap-6 md:grid-cols-2">
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
      </motion.section>
    </div>
  );
}
