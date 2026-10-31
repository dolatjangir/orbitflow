"use client";

import { useId } from "react";

type EmailWorkspaceProps = {
  onConnect: () => void;
  privacyHref: string;
};

export default function EmailWorkspace({
  onConnect,
  privacyHref,
}: EmailWorkspaceProps) {
  const id = useId().replace(/:/g, "");
  const icon = (name: string) => `#${id}-${name}`;

  const benefits = [
    {
      icon: "send",
      text: "Send personalized outreach at scale",
    },
    {
      icon: "track",
      text: "Track opens, clicks and replies",
    },
    {
      icon: "shield",
      text: "Warm-up and improve deliverability",
    },
    {
      icon: "mail",
      text: "Manage multiple email accounts",
    },
  ];

  const features = [
    {
      icon: "mail",
      title: "Multiple Providers",
      description:
        "Connect Gmail, Outlook, Yahoo, Zoho or any IMAP/SMTP email.",
    },
    {
      icon: "shield",
      title: "Better Deliverability",
      description: "Use warm-up and best practices to reach inbox.",
    },
    {
      icon: "chart",
      title: "Track Everything",
      description:
        "Monitor opens, clicks, replies and campaign performance.",
    },
  ];

  return (
    <section className="@container w-full min-w-0 bg-[var(--page)] text-[var(--text)]">
      {/* Reusable icons */}
      <svg
        aria-hidden="true"
        className="absolute h-0 w-0 overflow-hidden"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <symbol id={`${id}-mail`} viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 6 9 7 9-7" />
          </symbol>

          <symbol id={`${id}-send`} viewBox="0 0 24 24">
            <path d="m21 3-7 18-4-7-7-4L21 3Z" />
            <path d="m10 14 6-6" />
          </symbol>

          <symbol id={`${id}-track`} viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="4" />
            <path d="m10 8 6 4-6 4V8Z" />
          </symbol>

          <symbol id={`${id}-shield`} viewBox="0 0 24 24">
            <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />
            <path d="m8 12 3 3 5-6" />
          </symbol>

          <symbol id={`${id}-chart`} viewBox="0 0 24 24">
            <rect x="3" y="13" width="4" height="8" rx="1" />
            <rect x="10" y="8" width="4" height="13" rx="1" />
            <rect x="17" y="3" width="4" height="18" rx="1" />
          </symbol>

          <symbol id={`${id}-lock`} viewBox="0 0 24 24">
            <rect x="5" y="10" width="14" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
          </symbol>

          <symbol id={`${id}-plus`} viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </symbol>
        </defs>
      </svg>

      {/*
        Desktop:
        Available height = viewport height minus your existing header.

        Below 640px content width or 650px viewport height:
        Natural height keeps all content accessible.
      */}
      <div
        className="
          mx-auto flex min-h-[calc(100dvh-var(--header-height))]
          w-full max-w-[1500px] flex-col px-4 py-3
          @[900px]:px-7
          @[640px]:[@media(min-height:650px)]:h-[calc(100dvh-var(--header-height))]
        "
      >
        {/* Page introduction */}
        <div className="mb-3 shrink-0">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[1.5px] text-[var(--accent)]">
            <svg
              aria-hidden="true"
              className="size-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <use href={icon("send")} />
            </svg>

            EMAIL CHANNEL
          </div>

          <h1 className="m-0 text-[25px] leading-[1.2] font-bold tracking-[-0.7px]">
            Email workspace
          </h1>

          <p className="mt-1.5 text-[12px] leading-5 text-[var(--text-soft)]">
            Set up your email account to start sending personalized outreach at
            scale.
          </p>
        </div>

        {/* Main panel */}
        <div
          className="relative flex min-h-0 flex-1 flex-col rounded-[14px] border border-[var(--border)]"
          style={{
            background:
              "radial-gradient(ellipse at 80% 45%, var(--primary-soft), transparent 60%), var(--page)",
          }}
        >
          <div
            className="
              grid min-h-0 flex-1 grid-cols-1 gap-5 p-5
              @[640px]:grid-cols-[1.1fr_1fr]
              @[640px]:gap-6
              @[640px]:px-7
              @[640px]:py-5
              @[1000px]:gap-10
            "
          >
            {/* Left column */}
            <div className="flex min-h-0 min-w-0 flex-col">
              <div>
                <h2 className="m-0 text-[30px] leading-[1.08] font-bold tracking-[-1px] @[640px]:text-[34px] @[1000px]:text-[40px]">
                  Connect{" "}
                  <span className="text-[var(--primary)]">your</span>
                  <br />
                  <span className="text-[var(--primary)]">
                    email account
                  </span>
                </h2>

                <p className="mt-3 max-w-[390px] text-[14px] leading-[1.5] text-[var(--text-soft)]">
                  Send personalized emails, manage campaigns, and track
                  performance — all in one place.
                </p>

                <ul className="mt-4 flex list-none flex-col gap-2 p-0">
                  {benefits.map((benefit) => (
                    <li
                      key={benefit.text}
                      className="flex items-center gap-3 text-[12px] leading-5 @[1000px]:text-sm"
                    >
                      <span
                        className="grid size-[27px] shrink-0 place-items-center rounded-[10px] border border-[var(--border)] text-[var(--accent)]"
                        style={{
                          background:
                            "linear-gradient(145deg, var(--primary-soft), var(--surface-2))",
                        }}
                      >
                        <svg
                          aria-hidden="true"
                          className="size-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <use href={icon(benefit.icon)} />
                        </svg>
                      </span>

                      <span>{benefit.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Connection action */}
              <div className="mt-auto shrink-0 pt-4">
                <button
                  type="button"
                  onClick={onConnect}
                  className="
                    flex min-h-10 w-full items-center justify-center gap-2.5
                    rounded-lg border border-[var(--accent)] px-4 py-2.5
                    text-sm font-bold text-white
                    shadow-[0_8px_24px_var(--primary-soft)]
                    transition-[filter,transform]
                    hover:brightness-110
                    active:translate-y-px
                    focus-visible:outline-2
                    focus-visible:outline-offset-4
                    focus-visible:outline-[var(--primary)]
                  "
                  style={{
                    background:
                      "linear-gradient(110deg, var(--primary), var(--primary-strong))",
                  }}
                >
                  <svg
                    aria-hidden="true"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <use href={icon("plus")} />
                  </svg>

                  Connect Email Account
                </button>

                <p className="mt-2 text-center text-[11px] leading-5 text-[var(--text-soft)]">
                  It&apos;s secure, read our{" "}
                  <a
                    href={privacyHref}
                    className="
                      text-[var(--text)] underline-offset-4
                      hover:underline
                      focus-visible:outline-2
                      focus-visible:outline-[var(--primary)]
                    "
                  >
                    privacy policy.
                  </a>
                </p>
              </div>
            </div>

            {/* Right column */}
            <div className="flex min-h-0 min-w-0 flex-col">
              {/* Scalable illustration */}
              <div className="relative mx-auto min-h-0 w-full max-w-[390px] flex-1">
                <svg
                  viewBox="0 0 320 320"
                  preserveAspectRatio="xMidYMid meet"
                  className="
                    block h-auto w-full
                    @[640px]:[@media(min-height:650px)]:absolute
                    @[640px]:[@media(min-height:650px)]:inset-0
                    @[640px]:[@media(min-height:650px)]:h-full
                  "
                  role="img"
                  aria-label="Email providers connected to your email workspace"
                >
                  <defs>
                    <linearGradient
                      id={`${id}-window`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="var(--surface-2)" />
                      <stop offset="100%" stopColor="var(--page)" />
                    </linearGradient>

                    <linearGradient
                      id={`${id}-blue`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#42b4ff" />
                      <stop offset="100%" stopColor="#2375f4" />
                    </linearGradient>

                    <linearGradient
                      id={`${id}-tile`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#e6f0ff" />
                    </linearGradient>

                    <filter
                      id={`${id}-glow`}
                      x="-100%"
                      y="-100%"
                      width="300%"
                      height="300%"
                    >
                      <feGaussianBlur stdDeviation="12" />
                    </filter>

                    <marker
                      id={`${id}-arrow`}
                      viewBox="0 0 8 8"
                      refX="6"
                      refY="4"
                      markerWidth="7"
                      markerHeight="7"
                      orient="auto-start-reverse"
                    >
                      <path
                        d="m1 1 5 3-5 3"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="1"
                      />
                    </marker>
                  </defs>

                  {/* Browser panel */}
                  <path
                    d="M25 25 270 8Q282 7 282 20V289L15 309V40Q15 26 25 25Z"
                    fill={`url(#${id}-window)`}
                    stroke="var(--border-strong)"
                  />

                  <path
                    d="m16 62 266-19"
                    stroke="var(--border)"
                    fill="none"
                  />

                  <circle cx="37" cy="43" r="5" fill="#ff776b" />
                  <circle cx="55" cy="42" r="5" fill="#ffd348" />
                  <circle cx="73" cy="41" r="5" fill="#32d477" />

                  {/* Glow */}
                  <circle
                    cx="164"
                    cy="193"
                    r="50"
                    fill="var(--primary)"
                    opacity=".25"
                    filter={`url(#${id}-glow)`}
                  />

                  {/* Connection arrows */}
                  <g
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1.2"
                    strokeDasharray="4 5"
                    strokeLinecap="round"
                    markerEnd={`url(#${id}-arrow)`}
                    opacity=".85"
                  >
                    <path d="M117 181C91 176 93 163 91 151" />
                    <path d="M162 151C155 120 166 105 185 105" />
                    <path d="M192 176C213 168 224 156 237 158" />
                    <path d="M206 205C228 207 236 203 246 203" />
                    <path d="M192 232C205 254 218 256 233 255" />
                    <path d="M140 278C162 273 165 257 162 239" />
                    <path d="M70 218C87 223 101 217 117 212" />
                  </g>

                  {/* Gmail */}
                  <g transform="translate(65 90) rotate(-3 27 27)">
                    <rect
                      width="55"
                      height="52"
                      rx="9"
                      fill={`url(#${id}-tile)`}
                      stroke="#d8e7fa"
                    />

                    <path
                      d="M13 37V17l14 11 14-11v20"
                      fill="none"
                      stroke="#4285f4"
                      strokeWidth="6"
                      strokeLinejoin="round"
                    />

                    <path
                      d="m13 17 14 11 14-11"
                      fill="none"
                      stroke="#ea4335"
                      strokeWidth="6"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M41 18v19"
                      stroke="#34a853"
                      strokeWidth="6"
                    />

                    <path
                      d="m35 22 6-5"
                      stroke="#fbbc04"
                      strokeWidth="6"
                    />
                  </g>

                  {/* Outlook */}
                  {[
                    { x: 202, y: 77, size: 44 },
                    { x: 255, y: 119, size: 53 },
                  ].map(({ x, y, size }) => (
                    <g
                      key={x}
                      transform={`translate(${x} ${y}) rotate(-3) scale(${
                        size / 54
                      })`}
                    >
                      <rect
                        width="54"
                        height="54"
                        rx="8"
                        fill={`url(#${id}-tile)`}
                        stroke="#d8e7fa"
                      />

                      <rect
                        x="23"
                        y="11"
                        width="18"
                        height="26"
                        rx="2"
                        fill="#168bea"
                      />

                      <path d="M23 11h9v9h-9Z" fill="#52c6fa" />
                      <path d="M32 20h9v9h-9Z" fill="#0864ca" />
                      <path d="M22 26h22v17H22Z" fill="#25a7ef" />
                      <path d="m22 27 11 9 11-9" fill="#70d0ff" />

                      <rect
                        x="10"
                        y="20"
                        width="20"
                        height="23"
                        rx="2"
                        fill="#0864cf"
                      />

                      <text
                        x="20"
                        y="36"
                        textAnchor="middle"
                        fill="white"
                        fontSize="15"
                        fontWeight="700"
                        fontFamily="Arial, sans-serif"
                      >
                        O
                      </text>
                    </g>
                  ))}

                  {/* Mail */}
                  <g transform="translate(7 182) rotate(-3 25 25)">
                    <rect
                      width="52"
                      height="49"
                      rx="8"
                      fill={`url(#${id}-tile)`}
                      stroke="#d8e7fa"
                    />

                    <rect
                      x="11"
                      y="15"
                      width="30"
                      height="23"
                      rx="3"
                      fill="#05a7f5"
                    />

                    <path
                      d="m11 17 15 12 15-12M12 16l14-9 14 9"
                      fill="none"
                      stroke="#bcefff"
                      strokeWidth="1.5"
                    />
                  </g>

                  {/* Workspace */}
                  <g transform="translate(130 166)">
                    <rect
                      width="64"
                      height="63"
                      rx="17"
                      fill={`url(#${id}-blue)`}
                      stroke="#55b8ff"
                    />

                    <path
                      d="M16 32h9l8-16-1 31 9-18h8"
                      fill="none"
                      stroke="#06182e"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>

                  {/* Yahoo */}
                  <g transform="translate(253 220) rotate(-3 24 24)">
                    <rect
                      width="49"
                      height="49"
                      rx="9"
                      fill="#7108f5"
                      stroke="#9746ff"
                    />

                    <text
                      x="24"
                      y="35"
                      textAnchor="middle"
                      fill="white"
                      fontSize="35"
                      fontStyle="italic"
                      fontWeight="800"
                      fontFamily="Arial, sans-serif"
                    >
                      y!
                    </text>
                  </g>

                  {/* Additional provider */}
                  <g transform="translate(88 265) rotate(-2 24 24)">
                    <rect
                      width="49"
                      height="47"
                      rx="8"
                      fill={`url(#${id}-tile)`}
                      stroke="#d8e7fa"
                    />

                    <rect
                      x="12"
                      y="14"
                      width="25"
                      height="21"
                      rx="5"
                      fill="none"
                      stroke="#4285f4"
                      strokeWidth="3"
                    />

                    <path
                      d="m12 18 12 9 13-9"
                      fill="none"
                      stroke="#fbbc04"
                      strokeWidth="3"
                    />

                    <path
                      d="M12 28V17l10-5"
                      fill="none"
                      stroke="#34a853"
                      strokeWidth="3"
                    />

                    <path
                      d="m23 12 13 5"
                      fill="none"
                      stroke="#ea4335"
                      strokeWidth="3"
                    />
                  </g>
                </svg>
              </div>

              {/* Security */}
              <div
                className="mt-3 flex shrink-0 items-start gap-3 rounded-xl border border-[var(--border)] p-3"
                style={{
                  background:
                    "linear-gradient(120deg, var(--surface), var(--surface-2))",
                }}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--primary-soft)] text-[var(--accent)]">
                  <svg
                    aria-hidden="true"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <use href={icon("lock")} />
                  </svg>
                </span>

                <div className="min-w-0">
                  <h3 className="text-[12px] leading-5 font-bold">
                    Secure Connection
                  </h3>

                  <p className="mt-0.5 text-[10px] leading-[1.5] text-[var(--text-soft)] @[1000px]:text-xs">
                    We use OAuth for safe and secure access.
                    <br />
                    Your credentials are never stored.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom feature cards */}
        <div className="mt-3 grid shrink-0 grid-cols-1 gap-3 @[580px]:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--border)] px-3 py-3"
              style={{
                background:
                  "linear-gradient(120deg, var(--surface), var(--surface-2))",
              }}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-[10px] border border-[var(--border)] bg-[var(--primary-soft)] text-[var(--accent)]">
                <svg
                  aria-hidden="true"
                  className="size-[22px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <use href={icon(feature.icon)} />
                </svg>
              </span>

              <div className="min-w-0">
                <h3 className="text-[11px] leading-4 font-bold @[1000px]:text-sm">
                  {feature.title}
                </h3>

                <p className="mt-1 text-[10px] leading-[1.5] text-[var(--text-soft)] @[1000px]:text-xs">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}