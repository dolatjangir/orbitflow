"use client";

import { useState, type FormEvent } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  Building2,
  ChartNoAxesCombined,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Send,
  ShieldCheck,
  Star,
  Users,
  Zap,
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Connect your authentication API here.
    setNotice("Connect your authentication service to enable sign-in.");
  }

  function handleAction(action: string) {
    setNotice(`${action} is not connected yet.`);
  }

  const features = [
    { icon: Users, first: "Unified", second: "Contacts" },
    { icon: Send, first: "Multi-Channel", second: "Outreach" },
    { icon: ChartNoAxesCombined, first: "Smart", second: "Analytics" },
    { icon: Bot, first: "AI", second: "Automation" },
  ];

  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#020e23] px-4 py-6 text-[#f5f8ff] sm:px-8 lg:px-12 xl:px-16">
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 42% 32%, #073b8055, transparent 45%), radial-gradient(ellipse at 100% 75%, #1751aa77, transparent 45%)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[22%] top-[15%] -z-10 h-[560px] w-[560px] rounded-full opacity-60"
        style={{
          background: "linear-gradient(145deg, #00205922, #000714aa)",
          boxShadow:
            "inset -7px 8px 13px -8px #2497ff, 6px -6px 40px -20px #007bff",
        }}
      />

      {/* Header */}
      <header className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
        <div className="login-brand flex items-center gap-2.5 sm:gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#0060ff] via-[#479dff] to-[#ecffff] text-[#03152b] sm:size-12">
            <Activity size={31} strokeWidth={2.7} aria-hidden="true" />
          </span>

          <span className="text-2xl font-extrabold tracking-[-1.5px] sm:text-3xl">
            orbit<span className="text-[#0080ff]">flow</span>
          </span>
        </div>

        <div className="flex items-center gap-5">
          <span className="hidden text-sm text-[#d9e7ff] md:block">
            New to OrbitFlow?
          </span>

          <button
            type="button"
            onClick={() => handleAction("Demo booking")}
            className="flex items-center gap-2 rounded-2xl border border-[#007bff] bg-[#01122d80] px-3 py-2.5 text-xs font-semibold text-[#009aff] transition hover:bg-[#0b2851] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#71bdff] sm:px-4 sm:text-sm"
          >
            Request a Demo
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="mx-auto mt-6 grid max-w-[1440px] items-start gap-10 lg:grid-cols-[1.2fr_1fr] xl:gap-14">
        {/* Left content */}
        <section className="min-w-0 pt-2">
          <div className="login-intro text-center lg:text-left">
            <span className="inline-flex rounded-full border border-[#12376c] bg-[#09214a80] px-3 py-1 text-xs font-semibold text-[#00a5ff] sm:text-sm">
              AI-POWERED CRM
            </span>

            <h1 className="mt-4 text-4xl leading-[1.06] font-bold tracking-[-1.6px] sm:text-5xl xl:text-6xl">
              Turn Conversations
              <br className="hidden xl:block" /> into{" "}
              <span className="text-[#008bff]">Real Growth.</span>
            </h1>

            <p className="mx-auto mt-2 max-w-[620px] text-base leading-relaxed text-[#b9cfee] sm:text-lg lg:mx-0">
              Unify your contacts, automate outreach, and track performance
              — all in one intelligent workspace.
            </p>
          </div>

          <div className="mx-auto mt-4 grid max-w-[570px] grid-cols-4 gap-2 sm:gap-5 lg:mx-0">
            {features.map(({ icon: Icon, first, second }) => (
              <div key={first} className="text-center">
                <span className="mx-auto grid size-11 place-items-center rounded-[14px] border border-[#244975] bg-[#071c38] text-[#119cff] sm:size-14">
                  <Icon className="size-5 sm:size-6" aria-hidden="true" />
                </span>

                <p className="mt-1 text-[11px] leading-snug sm:text-sm">
                  {first}
                  <br />
                  {second}
                </p>
              </div>
            ))}
          </div>

          {/* Dashboard illustration built with JSX */}
          <div className="relative mt-12 hidden px-3 pb-10 lg:block">
            <div className="absolute -top-5 right-2 z-10 flex items-center gap-3 rounded-2xl border border-[#126cce] bg-[#082551] px-4 py-3 shadow-[0_0_25px_#007bff25]">
              <span className="grid size-10 place-items-center rounded-xl bg-[#123f89] text-[#25a3ff]">
                <Zap size={25} aria-hidden="true" />
              </span>
              <span className="text-xs">Automate Follow-ups</span>
            </div>

            <div
              className="overflow-hidden rounded-[24px] border border-[#168bff] bg-[#04132b] shadow-[0_0_45px_#007bff25]"
              style={{
                transform: "perspective(1200px) rotateY(7deg) rotateZ(-3deg)",
              }}
            >
              <div className="flex items-center gap-2 border-b border-[#16365d] px-5 py-4">
                <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-[#007aff] to-[#c6f2ff] text-[#03152b]">
                  <Activity size={20} aria-hidden="true" />
                </span>

                <span className="font-bold tracking-tight">
                  orbit<span className="text-[#008bff]">flow</span>
                </span>

                <span className="ml-auto text-[10px] text-[#7797c4]">
                  Workspace overview
                </span>
              </div>

              <div className="flex">
                <div className="w-[115px] shrink-0 border-r border-[#16365d] p-3">
                  {[
                    "Overview",
                    "Contacts",
                    "Deals",
                    "Campaigns",
                    "Analytics",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className={`mb-2 rounded-md px-2 py-2 text-[10px] ${
                        index === 0
                          ? "bg-[#0a3471] text-white"
                          : "text-[#aac4e8]"
                      }`}
                    >
                      {item}
                    </div>
                  ))}

                  <p className="mt-5 px-2 text-[8px] tracking-widest text-[#7797c4]">
                    CHANNELS
                  </p>

                  {["WhatsApp", "SMS", "RCS"].map((item) => (
                    <div
                      key={item}
                      className="px-2 py-2 text-[10px] text-[#aac4e8]"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="min-w-0 flex-1 p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Total contacts", value: "12,840" },
                      { label: "Active contacts", value: "8,204" },
                      { label: "Engaged this month", value: "2,480" },
                    ].map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-xl border border-[#154171] bg-[#082044] p-3"
                      >
                        <p className="text-[8px] text-[#b8cef0]">
                          {metric.label}
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          {metric.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-xl border border-[#15355c] bg-[#051a36] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#bdd2f0]">
                        Contact growth
                      </span>
                      <span className="text-[9px] text-[#32d7a0]">
                        +12%
                      </span>
                    </div>

                    <svg
                      viewBox="0 0 400 150"
                      className="mt-3 h-[160px] w-full"
                      role="img"
                      aria-label="Illustrative contact growth chart"
                    >
                      <defs>
                        <linearGradient
                          id="login-chart-fill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#007bff"
                            stopOpacity="0.5"
                          />
                          <stop
                            offset="100%"
                            stopColor="#007bff"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>

                      {[30, 65, 100, 135].map((y) => (
                        <line
                          key={y}
                          x1="10"
                          x2="390"
                          y1={y}
                          y2={y}
                          stroke="#173b64"
                          strokeDasharray="4 5"
                        />
                      ))}

                      <path
                        d="M10 125 L65 90 L120 108 L175 72 L230 57 L285 37 L340 40 L390 31 L390 145 L10 145 Z"
                        fill="url(#login-chart-fill)"
                      />

                      <path
                        d="M10 125 L65 90 L120 108 L175 72 L230 57 L285 37 L340 40 L390 31"
                        fill="none"
                        stroke="#2e9cff"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {[
                        [10, 125],
                        [65, 90],
                        [120, 108],
                        [175, 72],
                        [230, 57],
                        [285, 37],
                        [340, 40],
                        [390, 31],
                      ].map(([cx, cy]) => (
                        <circle
                          key={cx}
                          cx={cx}
                          cy={cy}
                          r="4"
                          fill="#92d5ff"
                          stroke="#1789ff"
                          strokeWidth="2"
                        />
                      ))}
                    </svg>

                    <div className="flex justify-between text-[9px] text-[#789bc9]">
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(
                        (month) => (
                          <span key={month}>{month}</span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-5 flex items-center gap-3 rounded-2xl border border-[#126cce] bg-[#082551] px-4 py-3 shadow-[0_0_25px_#007bff25]">
              <ArrowRight
                size={28}
                className="-rotate-45 text-[#51b6ff]"
                aria-hidden="true"
              />
              <span className="text-xs">Higher Conversions</span>
            </div>

            <div className="absolute right-0 bottom-1 flex items-center gap-3 rounded-2xl border border-[#126cce] bg-[#082551] px-4 py-3">
              <Users size={27} className="text-[#2698ff]" aria-hidden="true" />
              <span className="text-xs">Better Relationships</span>
            </div>
          </div>
        </section>

        {/* Login card */}
        <section
          aria-labelledby="login-title"
          className="mx-auto w-full max-w-[560px] rounded-[28px] border border-[#4799ef] bg-gradient-to-br from-[#0b2041]/95 via-[#03142e]/95 to-[#081e3d]/95 px-5 py-8 shadow-[0_18px_55px_#00000033] sm:px-9 sm:py-10"
        >
          <div className="login-brand flex items-center justify-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-[#0060ff] via-[#479dff] to-[#ecffff] text-[#03152b]">
              <Activity size={30} strokeWidth={2.7} aria-hidden="true" />
            </span>

            <span className="text-[33px] font-extrabold tracking-[-1.5px]">
              orbit<span className="text-[#0080ff]">flow</span>
            </span>
          </div>

          <h2
            id="login-title"
            className="mt-4 text-center text-[34px] leading-tight font-bold tracking-[-1px] sm:text-3xl"
          >
            Welcome Back
          </h2>

          <p className="mt-1 text-center text-base leading-relaxed text-[#b9cfee] sm:text-lg">
            Sign in to your workspace and continue
            <br className="hidden sm:block" /> your growth journey.
          </p>

          <form
            className="login-form mt-4 space-y-4"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-semibold sm:text-base"
              >
                Email address
              </label>

              <div className="flex items-center gap-4 rounded-xl border border-[#385783] bg-[#10274680] px-4 text-[#b5cff3] focus-within:border-[#3882f6] focus-within:ring-3 focus-within:ring-[#3882f6]/15">
                <Mail size={22} className="shrink-0" aria-hidden="true" />

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@company.com"
                  required
                  className="min-w-0 flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder:text-[#9bb9e2] sm:text-base"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="login-password-label mb-2 block text-sm font-semibold sm:text-base"
              >
                Password
              </label>

              <div className="flex items-center gap-4 rounded-xl border border-[#385783] bg-[#10274680] px-4 text-[#b5cff3] focus-within:border-[#3882f6] focus-within:ring-3 focus-within:ring-[#3882f6]/15">
                <LockKeyhole
                  size={22}
                  className="shrink-0"
                  aria-hidden="true"
                />

                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  className="min-w-0 flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder:text-[#9bb9e2] sm:text-base"
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((current) => !current)}
                  className="shrink-0 rounded-md p-1 hover:text-white focus-visible:outline-2 focus-visible:outline-[#71bdff]"
                >
                  {showPassword ? (
                    <Eye size={21} aria-hidden="true" />
                  ) : (
                    <EyeOff size={21} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 py-1 text-xs sm:text-sm">
              <label className="login-remember flex cursor-pointer items-center gap-2.5 text-[#e0eaff]">
                <input
                  name="remember"
                  type="checkbox"
                  defaultChecked
                  className="size-[18px] accent-[#1684ff]"
                />
                Keep me signed in
              </label>

              <button
                type="button"
                onClick={() => handleAction("Password recovery")}
                className="font-semibold text-[#0093ff] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#71bdff]"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="login-submit flex min-h-[57px] w-full items-center justify-center gap-3 rounded-xl border border-[#359cf7] bg-gradient-to-r from-[#258ff7] via-[#1767ff] to-[#2c8dfb] text-lg font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#71bdff]"
            >
              Sign in
              <ArrowRight size={21} aria-hidden="true" />
            </button>
          </form>

          <div className="login-divider my-6 flex items-center gap-4 text-sm text-[#dae6fa]">
            <span className="h-px flex-1 bg-[#2a4e78]" />
            <span>or continue with</span>
            <span className="h-px flex-1 bg-[#2a4e78]" />
          </div>

          <div className="login-social grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleAction("Google sign-in")}
              className="flex min-h-[55px] items-center justify-center gap-2.5 rounded-xl border border-[#294b79] bg-[#03122c66] px-3 text-[13px] transition hover:bg-[#13315b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#71bdff]"
            >
              <svg
                width="23"
                height="23"
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="shrink-0"
              >
                <path
                  fill="#4285F4"
                  d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"
                />
                <path
                  fill="#34A853"
                  d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.05v2.59A10 10 0 0 0 12 22Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.4 13.92a6 6 0 0 1 0-3.84V7.49H3.05a10 10 0 0 0 0 9.02l3.35-2.59Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.96c1.47 0 2.79.51 3.83 1.51l2.87-2.88A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.95 5.49l3.35 2.59C7.19 7.72 9.4 5.96 12 5.96Z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => handleAction("Microsoft sign-in")}
              className="flex min-h-[55px] items-center justify-center gap-2.5 rounded-xl border border-[#294b79] bg-[#03122c66] px-3 text-[13px] transition hover:bg-[#13315b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#71bdff]"
            >
              <span
                aria-hidden="true"
                className="grid size-[23px] shrink-0 grid-cols-2 grid-rows-2 gap-[2px]"
              >
                <span className="bg-[#f25022]" />
                <span className="bg-[#7fba00]" />
                <span className="bg-[#00a4ef]" />
                <span className="bg-[#ffb900]" />
              </span>
              Continue with Microsoft
            </button>
          </div>

          <p className="login-contact mt-8 text-center text-sm leading-relaxed text-[#c5d8f4]">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => handleAction("Administrator contact")}
              className="ml-1 font-semibold text-[#0093ff] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#71bdff]"
            >
              Contact your admin
            </button>
          </p>

          {notice && (
            <p
              role="status"
              className="mt-5 rounded-xl border border-[#2a4e78] bg-[#0b2444] px-4 py-3 text-center text-sm leading-relaxed text-[#c3ddff]"
            >
              {notice}
            </p>
          )}
        </section>
      </div>

      {/* Trust indicators */}
      <footer className="login-security mx-auto mt-10 flex max-w-[1000px] flex-wrap items-center justify-center gap-5 pb-2 sm:gap-10">
        {[
          {
            icon: Building2,
            value: "100K+",
            label: "Businesses trust OrbitFlow",
          },
          {
            icon: ShieldCheck,
            value: "99.9%",
            label: "Uptime & secure",
          },
          {
            icon: Star,
            value: "4.9/5",
            label: "Customer satisfaction",
          },
        ].map(({ icon: Icon, value, label }) => (
          <div key={value} className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl border border-[#153865] bg-[#09234e80] text-[#00a5ff] sm:size-13">
              <Icon size={29} aria-hidden="true" />
            </span>

            <div>
              <strong className="text-lg">{value}</strong>
              <p className="mt-0.5 text-[11px] text-[#c5d8f4] sm:text-xs">
                {label}
              </p>
            </div>
          </div>
        ))}
      </footer>
    </main>
  );
}