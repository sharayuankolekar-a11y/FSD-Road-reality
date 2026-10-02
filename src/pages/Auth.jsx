import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const DEMO_USER = {
  id: "demo-user-001",
  name: "Demo Commuter",
  email: "user@roadreality.demo",
  password: "User@123",
  role: "user",
};

const DEMO_ADMIN = {
  id: "demo-admin-001",
  name: "Road Authority Admin",
  email: "admin@roadreality.demo",
  password: "Admin@123",
  role: "admin",
};

export default function Auth({ mode }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState("");

  function updateField(fieldName, value) {
    setFormData((currentData) => ({
      ...currentData,
      [fieldName]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  }

  function saveSession(user) {
    const session = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken: "demo-road-reality-token",
    };

    localStorage.setItem("roadRealitySession", JSON.stringify(session));

    window.dispatchEvent(new Event("road-reality-auth-change"));
  }

  function redirectByRole(user) {
    if (user.role === "admin" || user.role === "authority") {
      navigate("/admin");
      return;
    }

    navigate("/explore");
  }

  function validateForm() {
    if (isSignup && formData.name.trim().length < 2) {
      return "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email address.";
    }

    if (!formData.email.includes("@")) {
      return "Please enter a valid email address.";
    }

    if (!formData.password) {
      return "Please enter your password.";
    }

    if (formData.password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (isSignup && formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  }

  function fillDemoAccount(accountType) {
    const account = accountType === "admin" ? DEMO_ADMIN : DEMO_USER;

    setFormData((currentData) => ({
      ...currentData,
      email: account.email,
      password: account.password,
    }));

    setSelectedDemoRole(accountType);
    setErrorMessage("");

    if (accountType === "admin") {
      setSuccessMessage(
        "Demo admin credentials are ready. Click Login as authority."
      );
    } else {
      setSuccessMessage(
        "Demo user credentials are ready. Click Login to continue."
      );
    }
  }

  async function handleLogin() {
    const enteredEmail = formData.email.trim().toLowerCase();
    const enteredPassword = formData.password;

    let matchedUser = null;

    if (
      enteredEmail === DEMO_ADMIN.email &&
      enteredPassword === DEMO_ADMIN.password
    ) {
      matchedUser = DEMO_ADMIN;
    }

    if (
      enteredEmail === DEMO_USER.email &&
      enteredPassword === DEMO_USER.password
    ) {
      matchedUser = DEMO_USER;
    }

    if (!matchedUser) {
      throw new Error(
        "Incorrect email or password. Use the demo access buttons for now."
      );
    }

    saveSession(matchedUser);

    setSuccessMessage(
      matchedUser.role === "admin"
        ? "Admin login successful. Opening authority dashboard..."
        : "Login successful. Opening the hazard map..."
    );

    setTimeout(() => {
      redirectByRole(matchedUser);
    }, 700);
  }

  async function handleSignup() {
    const newUser = {
      id: `demo-user-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: "user",
    };

    saveSession(newUser);

    setSuccessMessage(
      "Account created successfully. Opening the hazard map..."
    );

    setTimeout(() => {
      redirectByRole(newUser);
    }, 700);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (isSignup) {
        await handleSignup();
      } else {
        await handleLogin();
      }
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#FCFAF5] px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-[#D9D1C4] bg-white shadow-[0_20px_50px_rgba(20,83,45,0.10)] lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left information panel */}

        <section className="relative hidden overflow-hidden bg-[#14532D] p-10 text-white lg:flex lg:min-h-[640px] lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border-[28px] border-[#86B898]" />
            <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full border-[28px] border-[#E5B45D]" />
          </div>

          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#B85C45]">
                <ShieldCheck size={23} />
              </span>

              <span className="text-xl font-extrabold tracking-tight">
                Road Reality
              </span>
            </Link>
          </div>

          <div className="relative max-w-md">
            <p className="text-xs font-bold tracking-[0.18em] text-[#CBE1CF]">
              COMMUNITY ROAD INTELLIGENCE
            </p>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight">
              Safer roads begin with better local information.
            </h1>

            <p className="mt-5 text-base leading-7 text-[#D9EBDD]">
              Report hazards, view local road conditions, and help your
              community make better travel decisions.
            </p>

            <div className="mt-10 border-l-2 border-[#E5B45D] pl-4">
              <p className="text-sm font-bold text-white">
                Report · Verify · Track · Resolve
              </p>

              <p className="mt-1 text-sm text-[#CBE1CF]">
                Every report can help someone travel more safely.
              </p>
            </div>
          </div>

          <p className="relative text-sm text-[#CBE1CF]">
            Know the road before you take it.
          </p>
        </section>

        {/* Right form panel */}

        <section className="p-6 sm:p-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#14532D] lg:hidden"
          >
            <ShieldCheck size={18} />
            Road Reality
          </Link>

          <p className="mt-7 text-xs font-extrabold tracking-[0.16em] text-[#B85C45] lg:mt-0">
            {isSignup ? "CREATE COMMUTER ACCOUNT" : "WELCOME BACK"}
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-[#173E26] sm:text-4xl">
            {isSignup ? "Join Road Reality." : "Login to Road Reality."}
          </h2>

          <p className="mt-3 max-w-md leading-7 text-[#66706B]">
            {isSignup
              ? "Create an account to report hazards and track the condition of roads around you."
              : "Log in to explore hazards, report issues, and manage your road reports."}
          </p>

          {errorMessage && (
            <div
              className="mt-6 rounded-xl border border-[#EAB3AA] bg-[#FFF1EF] px-4 py-3 text-sm font-semibold text-[#A3382D]"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              className="mt-6 rounded-xl border border-[#B7D7BF] bg-[#EFF8F1] px-4 py-3 text-sm font-semibold text-[#27623A]"
              role="status"
            >
              {successMessage}
            </div>
          )}

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            {isSignup && (
              <label className="block">
                <span className="text-sm font-bold text-[#173E26]">
                  Full name
                </span>

                <span className="relative mt-2 block">
                  <UserRound
                    size={18}
                    className="absolute left-3 top-3.5 text-[#66706B]"
                  />

                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-[#D6D8D1] bg-white py-3 pl-10 pr-4 text-[#173E26] outline-none transition focus:border-[#14532D] focus:ring-4 focus:ring-[#14532D]/10"
                    disabled={isLoading}
                    required
                  />
                </span>
              </label>
            )}

            <label className="block">
              <span className="text-sm font-bold text-[#173E26]">
                Email address
              </span>

              <span className="relative mt-2 block">
                <Mail
                  size={18}
                  className="absolute left-3 top-3.5 text-[#66706B]"
                />

                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#D6D8D1] bg-white py-3 pl-10 pr-4 text-[#173E26] outline-none transition focus:border-[#14532D] focus:ring-4 focus:ring-[#14532D]/10"
                  disabled={isLoading}
                  required
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-[#173E26]">
                Password
              </span>

              <span className="relative mt-2 block">
                <KeyRound
                  size={18}
                  className="absolute left-3 top-3.5 text-[#66706B]"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#D6D8D1] bg-white py-3 pl-10 pr-16 text-[#173E26] outline-none transition focus:border-[#14532D] focus:ring-4 focus:ring-[#14532D]/10"
                  disabled={isLoading}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-2.5 rounded-lg p-1.5 text-[#14532D] hover:bg-[#EAF3EC]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            {isSignup && (
              <label className="block">
                <span className="text-sm font-bold text-[#173E26]">
                  Confirm password
                </span>

                <span className="relative mt-2 block">
                  <KeyRound
                    size={18}
                    className="absolute left-3 top-3.5 text-[#66706B]"
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(event) =>
                      updateField("confirmPassword", event.target.value)
                    }
                    placeholder="Enter password again"
                    className="w-full rounded-xl border border-[#D6D8D1] bg-white py-3 pl-10 pr-16 text-[#173E26] outline-none transition focus:border-[#14532D] focus:ring-4 focus:ring-[#14532D]/10"
                    disabled={isLoading}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="absolute right-3 top-2.5 rounded-lg p-1.5 text-[#14532D] hover:bg-[#EAF3EC]"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </span>
              </label>
            )}

            {/* Large dark-green login / signup button */}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex min-h-[58px] w-full items-center justify-center gap-2 rounded-xl bg-[#14532D] px-5 py-4 text-base font-extrabold text-white shadow-[0_8px_18px_rgba(20,83,45,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0D3D20] hover:shadow-[0_12px_24px_rgba(20,83,45,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <LoaderCircle size={20} className="animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  {isSignup
                    ? "Create commuter account"
                    : selectedDemoRole === "admin"
                      ? "Login as authority"
                      : "Login"}
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>

          {!isSignup && (
            <div className="mt-8">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-[#DDE2DC]" />
                <span className="text-xs font-bold tracking-[0.12em] text-[#758178]">
                  DEMO ACCESS
                </span>
                <span className="h-px flex-1 bg-[#DDE2DC]" />
              </div>

              <p className="mt-4 text-center text-sm text-[#66706B]">
                For project demonstration, choose a ready-made account.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount("user")}
                  disabled={isLoading}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    selectedDemoRole === "user"
                      ? "border-[#14532D] bg-[#EAF3EC] text-[#14532D]"
                      : "border-[#D6D8D1] bg-white text-[#3E4A42] hover:border-[#89A691]"
                  }`}
                >
                  <UserRound size={18} className="mr-2 inline-block" />
                  Use demo user
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount("admin")}
                  disabled={isLoading}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    selectedDemoRole === "admin"
                      ? "border-[#14532D] bg-[#14532D] text-white"
                      : "border-[#14532D] bg-[#F1F7F2] text-[#14532D] hover:bg-[#E1EFE4]"
                  }`}
                >
                  <ShieldCheck size={18} className="mr-2 inline-block" />
                  Use demo admin
                </button>
              </div>

              {selectedDemoRole === "admin" && (
                <p className="mt-3 rounded-lg bg-[#F1F7F2] px-3 py-2 text-center text-xs font-medium text-[#27623A]">
                  Admin email and password have been filled automatically.
                  Click <strong>Login as authority</strong> to continue.
                </p>
              )}
            </div>
          )}

          <p className="mt-8 text-center text-sm text-[#66706B]">
            {isSignup ? "Already have an account?" : "New to Road Reality?"}{" "}
            <Link
              to={isSignup ? "/login" : "/signup"}
              className="font-extrabold text-[#14532D] hover:text-[#0D3D20]"
            >
              {isSignup ? "Login" : "Create an account"}
            </Link>
          </p>

          {isSignup && (
            <p className="mt-5 rounded-xl bg-[#F4F6F2] px-4 py-3 text-center text-xs leading-5 text-[#66706B]">
              Public signup creates a regular commuter account. Admin access
              must be assigned securely by the backend or Supabase database.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}