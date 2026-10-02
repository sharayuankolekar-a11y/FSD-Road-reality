import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LogIn,
  LogOut,
  Menu,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

const navigationLinks = [
  { to: "/explore", label: "Explore" },
  { to: "/my-reports", label: "My reports" },
  { to: "/notifications", label: "Notifications" },
];

function getStoredUser() {
  const storedSession = localStorage.getItem("roadRealitySession");

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession).user;
  } catch {
    return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getStoredUser());

  useEffect(() => {
    function updateCurrentUser() {
      setCurrentUser(getStoredUser());
    }

    window.addEventListener("road-reality-auth-change", updateCurrentUser);

    return () => {
      window.removeEventListener(
        "road-reality-auth-change",
        updateCurrentUser
      );
    };
  }, []);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("roadRealitySession");

    setCurrentUser(null);
    setIsMobileMenuOpen(false);

    window.dispatchEvent(new Event("road-reality-auth-change"));

    navigate("/");
  }

  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "authority";

  return (
    <header className="sticky top-0 z-[1000] border-b border-[#DDE2DC] bg-[#FCFAF5]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 font-extrabold tracking-tight text-[#173E26]"
          onClick={closeMobileMenu}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#14532D] text-white">
            <ShieldAlert size={20} />
          </span>

          <span>Road Reality</span>
        </Link>

        {/* Desktop navigation */}

        <nav
          className="hidden items-center gap-5 md:flex"
          aria-label="Main navigation"
        >
          {navigationLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-bold transition ${
                  isActive
                    ? "text-[#14532D]"
                    : "text-[#66706B] hover:text-[#14532D]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `text-sm font-bold transition ${
                  isActive
                    ? "text-[#14532D]"
                    : "text-[#66706B] hover:text-[#14532D]"
                }`
              }
            >
              Admin
            </NavLink>
          )}

          {currentUser ? (
            <>
              <Link
                to={isAdmin ? "/admin" : "/profile"}
                className="inline-flex items-center gap-2 rounded-xl bg-[#EAF3EC] px-3 py-2 text-sm font-bold text-[#14532D]"
              >
                {isAdmin ? <ShieldCheck size={17} /> : <UserRound size={17} />}
                <span className="max-w-[130px] truncate">
                  {currentUser.name}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-[#C8D8CC] px-3 py-2 text-sm font-bold text-[#14532D] transition hover:bg-[#EAF3EC]"
              >
                <LogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#14532D] transition hover:text-[#0D3D20]"
              >
                <LogIn size={17} />
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-xl border border-[#14532D] px-3 py-2 text-sm font-bold text-[#14532D] transition hover:bg-[#EAF3EC]"
              >
                Sign up
              </Link>
            </>
          )}

          <Link
            to="/report"
            className="rounded-xl bg-[#14532D] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0D3D20]"
          >
            Report a hazard
          </Link>
        </nav>

        {/* Mobile menu button */}

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          className="rounded-lg p-2 text-[#173E26] hover:bg-[#EAF3EC] md:hidden"
          aria-label={
            isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {/* Mobile navigation */}

      {isMobileMenuOpen && (
        <nav
          className="border-t border-[#DDE2DC] bg-[#FCFAF5] p-4 md:hidden"
          aria-label="Mobile navigation"
        >
          {currentUser && (
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#EAF3EC] p-3 text-[#14532D]">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#14532D] text-white">
                {isAdmin ? <ShieldCheck size={18} /> : <UserRound size={18} />}
              </span>

              <div>
                <p className="text-sm font-extrabold">{currentUser.name}</p>
                <p className="text-xs font-medium">
                  {isAdmin ? "Authority administrator" : "Road Reality user"}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {navigationLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-[#EAF3EC] text-[#14532D]"
                      : "text-[#3E4A42] hover:bg-[#F1F7F2]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-[#EAF3EC] text-[#14532D]"
                      : "text-[#3E4A42] hover:bg-[#F1F7F2]"
                  }`
                }
              >
                Admin dashboard
              </NavLink>
            )}

            {currentUser && !isAdmin && (
              <NavLink
                to="/profile"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-[#EAF3EC] text-[#14532D]"
                      : "text-[#3E4A42] hover:bg-[#F1F7F2]"
                  }`
                }
              >
                My profile
              </NavLink>
            )}
          </div>

          {!currentUser ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#14532D] px-4 py-3 text-sm font-extrabold text-[#14532D]"
              >
                <LogIn size={17} />
                Login
              </Link>

              <Link
                to="/signup"
                onClick={closeMobileMenu}
                className="flex items-center justify-center rounded-xl bg-[#14532D] px-4 py-3 text-sm font-extrabold text-white"
              >
                Sign up
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D6A69F] bg-[#FFF4F2] px-4 py-3 text-sm font-extrabold text-[#A3382D]"
            >
              <LogOut size={17} />
              Logout
            </button>
          )}

          <Link
            to="/report"
            onClick={closeMobileMenu}
            className="mt-3 flex w-full items-center justify-center rounded-xl bg-[#14532D] px-4 py-3 text-sm font-extrabold text-white"
          >
            Report a hazard
          </Link>
        </nav>
      )}
    </header>
  );
}