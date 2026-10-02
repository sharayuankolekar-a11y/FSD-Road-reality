import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Camera,
  CheckCircle2,
  Clock3,
  Compass,
  MapPin,
  Navigation,
  Route,
  ShieldCheck,
  TriangleAlert,
  Upload,
  Users,
} from "lucide-react";

import HazardCard from "../components/HazardCard";
import { hazards } from "../services/mockData";

const categoryItems = [
  {
    icon: "🕳️",
    title: "Potholes",
    description: "Road-surface damage that can affect every vehicle.",
  },
  {
    icon: "🌊",
    title: "Waterlogging",
    description: "Flooded roads, drainage issues, and unsafe crossings.",
  },
  {
    icon: "🌳",
    title: "Fallen trees",
    description: "Obstructions caused by storms or damaged roadside trees.",
  },
  {
    icon: "🚧",
    title: "Blocked roads",
    description: "Closures, debris, diversions, and access restrictions.",
  },
  {
    icon: "💡",
    title: "Streetlights",
    description: "Broken streetlights and low-visibility safety concerns.",
  },
];

const workflowSteps = [
  {
    number: "01",
    icon: Camera,
    title: "Report",
    description:
      "Share what you see with a photo, location, severity, and traffic impact.",
  },
  {
    number: "02",
    icon: BadgeCheck,
    title: "Verify",
    description:
      "Reports gain confidence through the community and authority review.",
  },
  {
    number: "03",
    icon: Compass,
    title: "Track",
    description:
      "See updates, road conditions, and progress directly on the map.",
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Resolve",
    description:
      "Follow hazards until they are addressed and marked resolved.",
  },
];

const previewReports = [
  {
    type: "Pothole",
    location: "MG Road, Bengaluru",
    severity: "High",
    time: "4 min ago",
    icon: "🕳️",
    color: "border-[#C95C41]",
    labelColor: "bg-[#FBE5DD] text-[#9D4936]",
  },
  {
    type: "Waterlogging",
    location: "Brigade Road, Bengaluru",
    severity: "Medium",
    time: "12 min ago",
    icon: "🌊",
    color: "border-[#B9771D]",
    labelColor: "bg-[#FFF2D7] text-[#8C5B0F]",
  },
];

export default function Home() {
  return (
    <main className="page paper-texture overflow-hidden">
      {/* Hero */}

      <section className="relative overflow-hidden bg-[#202624] text-[#FCFAF5]">
        <div className="map-grid-texture absolute inset-0 opacity-80" />

        <div className="absolute -left-40 top-24 h-80 w-80 rounded-full bg-[#B85C45]/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#236B6B]/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          {/* Hero text */}

          <div className="animate-rise">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold tracking-[0.14em] text-[#E5B45D]">
              <span className="live-dot" aria-hidden="true" />
              LIVE ROAD INTELLIGENCE
            </div>

            <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-[#DDB4A6]">
              Road Reality
            </p>

            <h1 className="font-editorial mt-4 max-w-3xl text-4xl font-extrabold leading-[0.98] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Know the road
              <br />
              before you take it.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-[#D7DED8] sm:text-lg">
              Real-time local hazard reports from the people who are actually
              on the road. See what is happening nearby, make safer decisions,
              and help your community travel better.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/report" className="btn btn-primary">
                <TriangleAlert size={18} aria-hidden="true" />
                Report a hazard
                <ArrowRight size={17} aria-hidden="true" />
              </Link>

              <Link
                to="/explore"
                className="btn border border-white/20 bg-white/5 text-white hover:border-white/35 hover:bg-white/10"
              >
                <MapPin size={18} aria-hidden="true" />
                Explore the map
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#C7CEC8]">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#86B898]" />
                Community-powered reports
              </span>

              <span className="inline-flex items-center gap-2">
                <Clock3 size={17} className="text-[#E5B45D]" />
                Updates as conditions change
              </span>
            </div>
          </div>

          {/* Hero road intelligence preview */}

          <div className="animate-rise-delay relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative min-h-[420px] overflow-hidden rounded-[28px] border border-white/10 bg-[#33403B] shadow-2xl shadow-black/30 sm:min-h-[470px]">
              <div className="map-grid-texture absolute inset-0 opacity-60" />

              <div className="hero-route -left-36 -top-24" />
              <div className="hero-route -bottom-56 -right-36 opacity-60" />

              <div className="absolute left-[20%] top-[24%] h-2 w-2 rounded-full bg-[#E5B45D] shadow-[0_0_0_7px_rgba(229,180,93,0.16)]" />
              <div className="absolute right-[23%] top-[47%] h-2 w-2 rounded-full bg-[#86B898] shadow-[0_0_0_7px_rgba(134,184,152,0.13)]" />
              <div className="absolute bottom-[22%] left-[35%] h-2 w-2 rounded-full bg-[#D8705C] shadow-[0_0_0_7px_rgba(216,112,92,0.16)]" />

              <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                <div className="rounded-xl border border-white/10 bg-[#202624]/80 px-3 py-2 backdrop-blur">
                  <p className="text-[10px] font-bold tracking-[0.15em] text-[#DDB4A6]">
                    NEAR YOU
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-white">
                    Bengaluru, Karnataka
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#202624]/80 p-2.5 backdrop-blur">
                  <Navigation
                    size={18}
                    className="text-[#E5B45D]"
                    aria-label="Current location"
                  />
                </div>
              </div>

              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-[#202624]/85 p-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] text-[#DDB4A6]">
                      ROAD CONDITIONS
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      3 active reports nearby
                    </p>
                  </div>

                  <span className="rounded-full bg-[#476C55] px-2.5 py-1 text-xs font-bold text-white">
                    Updated now
                  </span>
                </div>

                <div className="route-line mt-4 opacity-70" />

                <div className="mt-3 flex items-center justify-between text-xs text-[#C7CEC8]">
                  <span className="inline-flex items-center gap-1.5">
                    <Route size={14} aria-hidden="true" />
                    MG Road corridor
                  </span>

                  <span>12.9716° N · 77.5946° E</span>
                </div>
              </div>

              {/* Floating live report cards */}

              <div className="animate-float-slow absolute left-4 top-[31%] w-[220px] rounded-2xl border border-white/70 bg-[#FCFAF5] p-3.5 text-[#202624] shadow-xl shadow-black/20 sm:left-7 sm:w-[245px]">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FBE5DD] text-lg">
                    {previewReports[0].icon}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-extrabold">
                        {previewReports[0].type}
                      </p>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${previewReports[0].labelColor}`}
                      >
                        {previewReports[0].severity}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs text-[#66706B]">
                      {previewReports[0].location}
                    </p>

                    <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#476C55]">
                      <BadgeCheck size={13} aria-hidden="true" />
                      Verified · {previewReports[0].time}
                    </p>
                  </div>
                </div>
              </div>

              <div className="animate-float-delayed absolute right-3 top-[52%] w-[205px] rounded-2xl border border-white/70 bg-white p-3.5 text-[#202624] shadow-xl shadow-black/20 sm:right-7 sm:w-[225px]">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#E3F0F0] text-lg">
                    {previewReports[1].icon}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-extrabold">
                        {previewReports[1].type}
                      </p>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${previewReports[1].labelColor}`}
                      >
                        {previewReports[1].severity}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs text-[#66706B]">
                      {previewReports[1].location}
                    </p>

                    <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#66706B]">
                      <Clock3 size={13} aria-hidden="true" />
                      Reported {previewReports[1].time}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}

      <section className="border-y border-[#E8DDCA] bg-[#F4EFE4]">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#476C55] shadow-sm">
              <Users size={19} aria-hidden="true" />
            </span>

            <div>
              <p className="text-sm font-bold text-[#202624]">
                Built by people on the road
              </p>
              <p className="text-xs text-[#66706B]">
                Local reports, shared when they matter.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#B9771D] shadow-sm">
              <BadgeCheck size={19} aria-hidden="true" />
            </span>

            <div>
              <p className="text-sm font-bold text-[#202624]">
                Clear verification status
              </p>
              <p className="text-xs text-[#66706B]">
                Know what is community-reported or verified.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#236B6B] shadow-sm">
              <BellRing size={19} aria-hidden="true" />
            </span>

            <div>
              <p className="text-sm font-bold text-[#202624]">
                Updates that follow the road
              </p>
              <p className="text-xs text-[#66706B]">
                Track reports from discovery to resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-[0.16em] text-[#B85C45]">
            WHAT PEOPLE REPORT
          </p>

          <h2 className="font-editorial mt-3 text-3xl font-extrabold leading-tight text-[#202624] sm:text-4xl">
            Road conditions change quickly.
            <br />
            Local awareness should too.
          </h2>

          <p className="mt-4 max-w-xl leading-7 text-[#66706B]">
            Road Reality helps surface temporary hazards that traditional
            navigation systems may not show immediately.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categoryItems.map((category) => (
            <div
              key={category.title}
              className="group card relative overflow-hidden p-5 transition duration-200 hover:-translate-y-1 hover:border-[#D3BCAE] hover:shadow-[0_15px_30px_rgba(44,49,44,0.09)]"
            >
              <div className="absolute left-0 top-0 h-1 w-full bg-[#E8DDCA] transition group-hover:bg-[#B85C45]" />

              <span className="text-3xl" role="img" aria-label={category.title}>
                {category.icon}
              </span>

              <h3 className="mt-5 font-bold text-[#202624]">
                {category.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#66706B]">
                {category.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}

      <section className="warm-grid-texture border-y border-[#E8DDCA] bg-[#F4EFE4]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.16em] text-[#B85C45]">
                SIMPLE BY DESIGN
              </p>

              <h2 className="font-editorial mt-3 text-3xl font-extrabold leading-tight text-[#202624] sm:text-4xl">
                See it. Share it.
                <br />
                Help make the next journey safer.
              </h2>
            </div>

            <Link
              to="/report"
              className="inline-flex items-center gap-2 self-start text-sm font-bold text-[#236B6B] transition hover:text-[#174F4F] md:self-auto"
            >
              Start a report
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="rounded-2xl border border-[#E1D7C8] bg-[#FCFAF5] p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold tracking-[0.16em] text-[#B85C45]">
                      {step.number}
                    </span>

                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EDE5D8] text-[#476C55]">
                      <Icon size={19} aria-hidden="true" />
                    </span>
                  </div>

                  <h3 className="mt-7 text-lg font-extrabold text-[#202624]">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#66706B]">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent reports */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.16em] text-[#B85C45]">
              FROM THE COMMUNITY
            </p>

            <h2 className="font-editorial mt-3 text-3xl font-extrabold text-[#202624] sm:text-4xl">
              Recent road reports
            </h2>

            <p className="mt-3 leading-7 text-[#66706B]">
              Clear reports from people who noticed something worth knowing
              before the next journey.
            </p>
          </div>

          <Link
            to="/explore"
            className="btn btn-secondary w-fit"
          >
            View all on map
            <MapPin size={17} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {hazards.slice(0, 3).map((hazard) => (
            <HazardCard key={hazard.id} hazard={hazard} />
          ))}
        </div>
      </section>

      {/* Community impact */}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[24px] bg-[#476C55] text-white">
          <div className="grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-12 lg:py-14">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#D6E8D8]">
                EVERY REPORT COUNTS
              </p>

              <h2 className="font-editorial mt-4 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
                Safer roads start with people looking out for one another.
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-[#E2EEE3]">
                A pothole, flooded road, fallen branch, or obstruction may
                only take a minute to report—but that information can help the
                next commuter make a safer decision.
              </p>

              <Link
                to="/report"
                className="btn mt-7 bg-[#FCFAF5] text-[#202624] hover:bg-white"
              >
                <Upload size={17} aria-hidden="true" />
                Make a road report
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-3xl font-extrabold">128</p>
                <p className="mt-1 text-sm text-[#D6E8D8]">
                  Reports shared
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-3xl font-extrabold">34</p>
                <p className="mt-1 text-sm text-[#D6E8D8]">
                  Active hazards
                </p>
              </div>

              <div className="col-span-2 rounded-2xl border border-white/15 bg-[#202624]/20 p-5">
                <p className="flex items-center gap-2 text-sm font-bold">
                  <ShieldCheck size={18} className="text-[#B7D5BD]" />
                  A clearer picture of the road ahead
                </p>

                <p className="mt-2 text-sm leading-6 text-[#D6E8D8]">
                  Reports move from community observation to verification,
                  tracking, and eventual resolution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}