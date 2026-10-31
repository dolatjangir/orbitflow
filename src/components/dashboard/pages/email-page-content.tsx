"use client";

import EmailWorkspace from "@/components/dashboard/pages/email-workspace";

export function EmailPageContent() {
  // Dummy connection function
  const connectChannel = (name: string) => {
    alert(
      `${name} connection flow is not configured yet. Please configure your provider credentials.`
    );
  };

  return (
    <EmailWorkspace
      onConnect={() => connectChannel("Email")}
      privacyHref="/"
    />
  );
}