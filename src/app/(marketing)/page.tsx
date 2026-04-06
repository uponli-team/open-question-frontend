"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  BrainCircuit,
  ChevronRight,
  Layers2,
  Database,
  Search,
  Sparkles,
  Orbit,
  Wrench,
  Zap,
  Shield,
  Users,
  LineChart,
  Headphones,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FadeInSection,
  fadeItem,
  staggerContainer,
} from "@/components/ui/motion";

const preview = [
  {
    id: "p1",
    problem: "Can we construct a fast algorithm for equitable graph coloring?",
    field: "Computer Science",
    keywords: ["graphs", "complexity", "optimization"],
  },
  {
    id: "p2",
    problem: "How can we prove that every quantum error-correcting code has a compact decoder?",
    field: "Quantum Computing",
    keywords: ["quantum", "error correction", "decoding"],
  },
  {
    id: "p3",
    problem: "What is the exact threshold for robust cooperation in evolving public goods games?",
    field: "Evolutionary Biology",
    keywords: ["cooperation", "dynamics", "thresholds"],
  },
];

const featuresThree = [
  {
    icon: Database,
    title: "Structured Problem Database",
    description:
      "Normalize each record into problem, field, and keyword dimensions for reliable search and analysis.",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    icon: BrainCircuit,
    title: "AI-powered extraction",
    description:
      "Validate uploads today and plug in model-assisted parsing when your pipeline is ready.",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    icon: Orbit,
    title: "Real-time updates",
    description:
      "Subscribe to new problems with Supabase realtime, with a safe mock fallback for local dev.",
    iconBg: "bg-lime-100",
    iconColor: "text-lime-700",
  },
];

export default function MarketingLandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="py-20 px-[clamp(24px,4vw,64px)]">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-2"
              >
                <span className="text-sm font-medium text-emerald-700">
                  MODERN INFRASTRUCTURE FOR OPEN QUESTIONS
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl lg:text-6xl"
              >
                Explore the World&apos;s{" "}
                <span className="text-emerald-600">Unsolved Problems</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
                className="max-w-lg text-lg leading-relaxed text-gray-600"
              >
                Collect and structure unresolved questions from any domain.
                OQD gives your team a focused interface to search, track, and
                expand collective research direction.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="flex flex-col gap-4 sm:flex-row"
              >
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    className="bg-emerald-600 px-8 py-6 text-lg hover:bg-emerald-700"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-emerald-600 px-8 py-6 text-lg text-emerald-700 hover:bg-emerald-50"
                  >
                    Explore Problems
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* OQD visual panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <div className="relative h-96 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-8 lg:h-[500px]">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-8 top-8 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="text-xs font-semibold text-zinc-500">Problem Stream</div>
                  <div className="mt-2 h-2 w-28 rounded bg-zinc-200" />
                  <div className="mt-2 h-2 w-20 rounded bg-emerald-200" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute right-8 top-20 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="text-xs font-semibold text-zinc-500">Field Clusters</div>
                  <div className="mt-2 flex gap-2">
                    <span className="h-6 w-6 rounded-full bg-emerald-100" />
                    <span className="h-6 w-6 rounded-full bg-teal-100" />
                    <span className="h-6 w-6 rounded-full bg-lime-100" />
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-10 left-10 right-10 rounded-2xl border border-emerald-200 bg-white p-5 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-emerald-700">Live Query Layer</div>
                      <div className="mt-1 text-sm font-semibold text-zinc-900">
                        Explore cross-domain unresolved problems
                      </div>
                    </div>
                    <Layers2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-zinc-700">Graph Theory</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-zinc-700">Quantum</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-zinc-700">Systems</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <FadeInSection
          id="features"
          className="scroll-mt-24 py-20 px-[clamp(24px,4vw,64px)]"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              FEATURES
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Everything you need to structure, search, and follow open
              problems across domains.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-8 md:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {featuresThree.map((feature) => (
              <motion.div key={feature.title} variants={fadeItem}>
                <Card className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                  <div className="p-6 pb-4 text-center">
                    <motion.div
                      whileHover={{ scale: 1.06, rotate: 4 }}
                      transition={{ duration: 0.25 }}
                      className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg ${feature.iconBg}`}
                    >
                      <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                  <div className="px-6 pb-6 text-center">
                    <p className="leading-relaxed text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-8 grid gap-4 md:grid-cols-1"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeItem}>
              <Card className="border-0 p-7 shadow-lg">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start">
                  <div className="rounded-xl bg-gray-100 p-2 text-gray-700">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      Search &amp; filtering
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      Query by text and narrow by field with pagination tuned for
                      large datasets.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </FadeInSection>

        {/* About / trust — still on page, not in navbar */}
        <FadeInSection id="about" className="scroll-mt-24 py-20 px-[clamp(24px,4vw,64px)]">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 px-6 py-14 md:px-12">
            <motion.svg
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 text-emerald-200/60 md:h-64 md:w-64"
              viewBox="0 0 200 200"
              initial={{ opacity: 0, rotate: -8 }}
              whileInView={{ opacity: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 6" />
              <path d="M100 12v176M12 100h176" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
            </motion.svg>
            <div className="relative mb-16 text-center">
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl"
              >
                Built For Focused Research Teams
              </motion.h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                Built for researchers, developers, and thinkers who need a calm,
                structured place to curate hard questions — without losing context.
              </p>
            </div>
            <motion.div
              className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {[
                { label: "12k+", sub: "Questions indexed" },
                { label: "98%", sub: "Schema quality" },
                { label: "Realtime", sub: "Live updates" },
                { label: "24/7", sub: "Workflow ready" },
              ].map((stat) => (
                <motion.div key={stat.label} variants={fadeItem}>
                  <Card className="border-0 p-6 text-center shadow-lg">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.label}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">{stat.sub}</div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </FadeInSection>

        <FadeInSection id="services" className="scroll-mt-24 py-20 px-[clamp(24px,4vw,64px)]">
          <div className="relative mb-12 text-center">
            <motion.svg
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full opacity-40"
              width="120"
              height="40"
              viewBox="0 0 120 40"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 0.4, y: 0 }}
              viewport={{ once: true }}
            >
              <path
                d="M10 30 Q60 0 110 30"
                fill="none"
                stroke="currentColor"
                className="text-emerald-400"
                strokeWidth="2"
              />
            </motion.svg>
            <h2 className="text-3xl font-bold uppercase tracking-tight text-gray-900 md:text-5xl">
              Services
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              End-to-end workflows to ingest, structure, and monitor open
              questions for teams and research groups.
            </p>
          </div>
          <motion.div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {[
              {
                title: "Dataset Structuring",
                body: "Standardize raw problem statements into clean fields and keyword arrays.",
                icon: Layers2,
              },
              {
                title: "Realtime Monitoring",
                body: "Track new inserts and keep your discovery workflows updated automatically.",
                icon: Zap,
              },
              {
                title: "Research Workspace Setup",
                body: "Configure filtering, tagging, and views for domain-specific discovery pipelines.",
                icon: Users,
              },
              {
                title: "Schema & validation audits",
                body: "Run periodic checks against your schema to catch drift before it breaks dashboards.",
                icon: Wrench,
              },
              {
                title: "Secure ingestion pipelines",
                body: "Upload CSV/JSON with row-level validation, duplicate detection, and safe rollbacks.",
                icon: Shield,
              },
              {
                title: "Analytics & exports",
                body: "Slice fields and keywords into reports, or export curated subsets for offline work.",
                icon: LineChart,
              },
            ].map((service) => (
              <motion.div key={service.title} variants={fadeItem}>
                <Card className="group relative h-full overflow-hidden border-0 p-7 shadow-lg transition-shadow hover:shadow-xl">
                  <motion.div
                    className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-100/50 transition-transform duration-500 group-hover:scale-110"
                    aria-hidden
                  />
                  <div className="relative flex items-start gap-4">
                    <motion.div
                      whileHover={{ scale: 1.08, rotate: -3 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"
                    >
                      <service.icon className="h-6 w-6" />
                    </motion.div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {service.title}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {service.body}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-6 sm:flex-row sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                <Headphones className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Need a custom rollout?</div>
                <p className="text-sm text-gray-600">
                  We help map your sources, tags, and governance rules before go-live.
                </p>
              </div>
            </div>
            <Link href="/#contact">
              <Button className="w-full shrink-0 sm:w-auto">Talk to us</Button>
            </Link>
          </motion.div>
        </FadeInSection>

        {/* Process */}
        <FadeInSection
          id="process"
          className="scroll-mt-24 border-y border-gray-100 bg-gray-50/50 py-20 px-[clamp(24px,4vw,64px)]"
        >
          <div className="relative mb-12 text-center">
            <motion.svg
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 hidden -translate-y-1/2 text-emerald-100 lg:block"
              width="80"
              height="160"
              viewBox="0 0 80 160"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <path d="M40 8v144" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
            </motion.svg>
            <h2 className="text-3xl font-bold uppercase tracking-tight text-gray-900 md:text-5xl">
              PROCESS
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              From raw material to a living research map — ingest, validate, enrich, ship, and
              iterate with your team.
            </p>
          </div>

          <div className="relative mx-auto max-w-5xl">
            <motion.svg
              aria-hidden
              className="pointer-events-none absolute left-[clamp(1rem,4vw,2rem)] top-8 hidden h-[calc(100%-4rem)] w-3 text-emerald-300/80 md:block"
              preserveAspectRatio="none"
              viewBox="0 0 12 400"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <motion.path
                d="M6 0 V400"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.svg>
            <div className="relative space-y-6 md:space-y-10 md:pl-14">
              {[
                {
                  step: "01",
                  title: "Capture",
                  body: "Upload raw source files, research datasets, or connect a lightweight ingestion pipeline.",
                },
                {
                  step: "02",
                  title: "Extract",
                  body: "Normalize text into problem statements and surface candidate fields with consistent parsing rules.",
                },
                {
                  step: "03",
                  title: "Structure",
                  body: "Validate every record and map to a clean schema with reliable tags and keyword arrays.",
                },
                {
                  step: "04",
                  title: "Explore",
                  body: "Navigate with fast filters, detail views, and realtime update hooks across your team.",
                },
                {
                  step: "05",
                  title: "Iterate",
                  body: "Review quality metrics, merge duplicates, and schedule refreshes as new sources arrive.",
                },
              ].map((s, idx) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: idx * 0.06 }}
                  className="relative"
                >
                  <Card className="border-0 bg-white p-6 shadow-lg md:p-8 md:pl-10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-bold text-white shadow-md"
                        >
                          {s.step}
                        </motion.div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{s.title}</div>
                          <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.body}</p>
                        </div>
                      </div>
                      {idx < 4 && (
                        <div className="hidden items-center gap-3 sm:flex">
                          <ChevronRight className="h-5 w-5 text-emerald-400" />
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeInSection>

        <FadeInSection
          id="blogs"
          className="scroll-mt-24 border-y border-gray-100 bg-gray-50/50 py-20 px-[clamp(24px,4vw,64px)]"
        >
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold uppercase tracking-tight text-gray-900 md:text-5xl">
              Blogs
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              Insights on problem curation, research systems, and tooling for
              unresolved scientific and technical questions.
            </p>
          </div>
          <motion.div
            className="grid gap-5 md:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {[
              {
                title: "How to build a high-signal question database",
                date: "Jan 10, 2026",
              },
              {
                title: "From raw PDFs to structured open-problem maps",
                date: "Feb 22, 2026",
              },
              {
                title: "Realtime collaboration patterns for research teams",
                date: "Mar 14, 2026",
              },
            ].map((post) => (
              <motion.div key={post.title} variants={fadeItem}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <Card className="h-full border-0 p-7 shadow-lg">
                    <div className="text-xs font-medium text-emerald-700">{post.date}</div>
                    <div className="mt-3 text-lg font-semibold text-gray-900">
                      {post.title}
                    </div>
                    <button
                      type="button"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      Read article
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </FadeInSection>

        <FadeInSection id="pricing" className="scroll-mt-24 py-20 px-[clamp(24px,4vw,64px)]">
          <div className="relative mb-12 text-center">
            <motion.svg
              aria-hidden
              className="pointer-events-none absolute -left-4 top-1/2 hidden h-32 w-32 -translate-y-1/2 text-emerald-100 md:block lg:left-8"
              viewBox="0 0 120 120"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <rect x="8" y="8" width="104" height="104" rx="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 40h104M40 8v104" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
            </motion.svg>
            <motion.svg
              aria-hidden
              className="pointer-events-none absolute -right-4 top-1/2 hidden h-28 w-28 -translate-y-1/2 text-teal-100 md:block lg:right-8"
              viewBox="0 0 100 100"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <polygon points="50,8 92,92 8,92" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="50" cy="48" r="8" fill="currentColor" opacity="0.35" />
            </motion.svg>
            <h2 className="text-3xl font-bold uppercase tracking-tight text-gray-900 md:text-5xl">
              Pricing
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              Flexible plans for solo builders, research teams, and enterprise workflows. Annual
              billing saves 15% on Pro.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                name: "Starter",
                price: "$0",
                cadence: "forever free",
                features: [
                  "Mock dataset access",
                  "Dashboard + detail views",
                  "Basic text & field filters",
                  "Community support",
                  "Single workspace",
                ],
              },
              {
                name: "Pro",
                price: "$29",
                cadence: "per seat / month",
                features: [
                  "Everything in Starter",
                  "Realtime Supabase sync",
                  "Admin bulk uploads",
                  "Team roles & shared views",
                  "Webhook & export jobs",
                  "Email support (48h)",
                ],
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                cadence: "contact sales",
                features: [
                  "Private cloud or on-prem",
                  "Custom ingestion pipelines",
                  "SSO & audit logs",
                  "SLA & priority support",
                  "Dedicated success engineer",
                  "Custom retention & backups",
                ],
              },
            ].map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
              >
                <Card
                  className={`relative h-full overflow-hidden border-0 p-7 shadow-lg ${
                    plan.highlight ? "ring-2 ring-emerald-500/40" : ""
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute right-4 top-4 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Popular
                    </div>
                  )}
                  <div className="text-sm font-medium text-gray-500">{plan.name}</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-xs text-gray-500">{plan.cadence}</span>
                  </div>
                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-gray-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-8 w-full" variant={plan.highlight ? "default" : "outline"}>
                    {plan.name === "Enterprise" ? "Contact sales" : "Choose plan"}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 text-center text-sm text-gray-500"
          >
            Taxes may apply. Nonprofits and academic labs can request discounted Pro —{" "}
            <Link href="/#contact" className="font-medium text-emerald-700 hover:underline">
              get in touch
            </Link>
            .
          </motion.p>
        </FadeInSection>

        <FadeInSection id="preview" className="scroll-mt-24 py-20 px-[clamp(24px,4vw,64px)]">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold uppercase tracking-tight text-gray-900 md:text-5xl">
                PREVIEW
              </h2>
              <p className="mt-2 text-gray-600">
                Problem cards with tags and quick actions.
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-emerald-200">
                Explore Problems
              </Button>
            </Link>
          </div>

          <motion.div
            className="grid gap-4 md:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {preview.map((p) => (
              <motion.div key={p.id} variants={fadeItem}>
                <Card className="overflow-hidden border-0 shadow-lg transition-shadow hover:shadow-xl">
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold text-emerald-700">
                        {p.field}
                      </div>
                      <Badge className="bg-gray-100 text-gray-700">
                        Unsolved
                      </Badge>
                    </div>
                    <div className="mt-3 text-sm font-semibold text-gray-900">
                      {p.problem}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.keywords.map((k) => (
                        <span
                          key={k}
                          className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-700"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5">
                      <Link href={`/dashboard/problems/${p.id}`}>
                        <Button size="sm" className="w-full">
                          View details
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </FadeInSection>

        <FadeInSection
          id="contact"
          className="scroll-mt-24 border-y border-gray-100 bg-gray-50/50 py-20 px-[clamp(24px,4vw,64px)]"
        >
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold uppercase tracking-tight text-gray-900 md:text-5xl">
                Contact Us
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-gray-600">
                Tell us what kinds of open-problem workflows you need and we&apos;ll
                help you set up the right structure.
              </p>
            </div>
            <Card className="border-0 p-7 shadow-lg">
              <form className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="First name"
                  className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 sm:col-span-2"
                />
                <textarea
                  placeholder="Tell us about your use case"
                  className="min-h-[120px] rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 sm:col-span-2"
                />
                <div className="sm:col-span-2">
                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    Send message
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </FadeInSection>

        <FadeInSection className="pb-24 pt-4 px-[clamp(24px,4vw,64px)]">
          <Card className="overflow-hidden border-0 bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white shadow-xl md:p-12">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                  <Sparkles className="h-3.5 w-3.5" />
                  Ready when your backend is ready
                </div>
                <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                  Start curating open questions today
                </h2>
                <p className="mt-3 text-white/90">
                  Mock APIs power pagination and uploads — swap in production
                  endpoints without changing the UI.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    className="bg-white px-8 text-emerald-700 hover:bg-emerald-50"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/50 text-white hover:bg-white/10"
                  >
                    Explore Problems
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </FadeInSection>
      </div>
    </main>
  );
}
