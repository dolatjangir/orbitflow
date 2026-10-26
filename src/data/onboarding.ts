export const onboardingSteps = [
  { id: "connect", title: "Connect your WhatsApp number", description: "Link your business number with your messaging provider.", detail: "Connect a WhatsApp Business number to start sending approved messages and receiving customer replies.", time: "~5 min" },
  { id: "contacts", title: "Import your contacts", description: "Upload a CSV with a phone column, or add contacts one by one.", detail: "Bring your customer list into one workspace. CSV imports will be connected to your CRM integration in a future release.", time: "~3 min" },
  { id: "template", title: "Create a message template", description: "Templates help your team launch consistent campaigns.", detail: "Create a reusable message template with a clear purpose, audience, and call to action.", time: "~4 min" },
  { id: "wallet", title: "Top up your wallet", description: "Credits power broadcasts, AI replies and voice calls.", detail: "Add demo credits to explore billing controls. Live payments are not enabled in this starter project.", time: "~1 min" },
  { id: "agent", title: "Build a chatbot or AI agent", description: "Auto-answer customers 24×7 with flows or an AI agent.", detail: "Define your agent's role, connect a knowledge source, and route complex questions to a human teammate.", time: "~8 min" },
  { id: "broadcast", title: "Send your first broadcast", description: "Pick an approved template and reach your contacts.", detail: "Schedule a test campaign for a small audience before sending to your full contact list.", time: "~2 min" },
] as const;

