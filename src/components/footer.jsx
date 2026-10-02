import { Link } from "react-router-dom";
import { ArrowUpRight, MapPinned, ShieldAlert } from "lucide-react";

const footerLinks = [
  { label: "Explore map", to: "/explore" },
  { label: "Report a hazard", to: "/report" },
  { label: "My reports", to: "/my-reports" },
  { label: "Notifications", to: "/notifications" },
];

export default function Footer() {
  return (
    <footer className="bg-[#202624] text-[#FCFAF5]">
      <div className="map-grid-texture">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.3fr_0.7fr_0.8fr]">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-lg font-extrabold tracking-tight"
                aria-label="Road Reality home"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#B85C45] text-white">
                  <ShieldAlert size={21} aria-hidden="true" />
                </span>

                <span>Road Reality</span>
              </Link>

              <p className="font-editorial mt-5 max-w-sm text-2xl font-bold leading-tight text-white">
                Know the road before you take it.
              </p>

              <p className="mt-4 max-w-sm text-sm leading-6 text-[#C7CEC8]">
                A crowdsourced road-hazard network helping people make safer,
                better-informed journeys.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#DDB4A6]">
                EXPLORE
              </p>

              <nav className="mt-4 flex flex-col items-start gap-3">
                {footerLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="group inline-flex items-center gap-2 text-sm text-[#E7E7E1] transition hover:text-white"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={14}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#DDB4A6]">
                BUILT FOR SAFER STREETS
              </p>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <MapPinned size={20} className="text-[#E5B45D]" aria-hidden="true" />

                <p className="mt-3 text-sm font-semibold text-white">
                  Report. Verify. Track. Resolve.
                </p>

                <p className="mt-1 text-sm leading-6 text-[#C7CEC8]">
                  Every report can help someone choose a safer route.
                </p>
              </div>
            </div>
          </div>

          <div className="road-line mt-10 border-white/20" />

          <div className="mt-5 flex flex-col gap-2 text-xs text-[#AEB8B0] sm:flex-row sm:items-center sm:justify-between">
            <p>Road Reality · College Full Stack Development Project</p>
            <p>Frontend experience designed for safer local travel.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}