export type Contact = {
  id: string;
  name: string;
  email: string;
  company: string;
  channel: string;
  status: "Active" | "Engaged" | "Inactive";
  added: string;
};

export type Deal = {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: "New lead" | "Qualified" | "Proposal" | "Negotiation" | "Won";
  owner: string;
  closeDate: string;
};

export const initialContacts: Contact[] = [
  { id: "CT-1048", name: "Maya Patel", email: "maya@northstar.io", company: "Northstar Studio", channel: "WhatsApp", status: "Active", added: "Oct 22, 2026" },
  { id: "CT-1047", name: "Arjun Mehta", email: "arjun@brightlabs.co", company: "BrightLabs", channel: "Email", status: "Engaged", added: "Oct 21, 2026" },
  { id: "CT-1046", name: "Sofia Bennett", email: "sofia@craftandco.com", company: "Craft & Co.", channel: "SMS", status: "Active", added: "Oct 20, 2026" },
  { id: "CT-1045", name: "Kabir Shah", email: "kabir@vertexworks.in", company: "Vertex Works", channel: "WhatsApp", status: "Inactive", added: "Oct 19, 2026" },
  { id: "CT-1044", name: "Olivia Chen", email: "olivia@fieldnote.app", company: "Fieldnote", channel: "Email", status: "Active", added: "Oct 18, 2026" },
  { id: "CT-1043", name: "Ishaan Rao", email: "ishaan@monocle.ai", company: "Monocle AI", channel: "RCS", status: "Engaged", added: "Oct 17, 2026" },
  { id: "CT-1042", name: "Ava Williams", email: "ava@heyday.design", company: "Heyday Design", channel: "Email", status: "Active", added: "Oct 16, 2026" },
];

export const initialDeals: Deal[] = [
  { id: "DL-2081", name: "Customer support automation", company: "Northstar Studio", value: 48000, stage: "Negotiation", owner: "Anushka Jangid", closeDate: "Oct 30, 2026" },
  { id: "DL-2080", name: "Lifecycle messaging", company: "BrightLabs", value: 28500, stage: "Proposal", owner: "Anushka Jangid", closeDate: "Nov 04, 2026" },
  { id: "DL-2079", name: "Voice assistant pilot", company: "Vertex Works", value: 19500, stage: "Qualified", owner: "Rohan Verma", closeDate: "Nov 08, 2026" },
  { id: "DL-2078", name: "WhatsApp commerce", company: "Craft & Co.", value: 32000, stage: "New lead", owner: "Anushka Jangid", closeDate: "Nov 12, 2026" },
  { id: "DL-2077", name: "Retention program", company: "Fieldnote", value: 15000, stage: "Won", owner: "Rohan Verma", closeDate: "Oct 24, 2026" },
];

export const onboardingSteps = [
  { id: "connect", title: "Connect your WhatsApp number", description: "Link your business number with your messaging provider.", detail: "Connect a WhatsApp Business number to start sending approved messages and receiving customer replies.", time: "~5 min" },
  { id: "contacts", title: "Import your contacts", description: "Upload a CSV with a phone column, or add contacts one by one.", detail: "Bring your customer list into one workspace. CSV imports will be connected to your CRM integration in a future release.", time: "~3 min" },
  { id: "template", title: "Create a message template", description: "Templates help your team launch consistent campaigns.", detail: "Create a reusable message template with a clear purpose, audience, and call to action.", time: "~4 min" },
  { id: "wallet", title: "Top up your wallet", description: "Credits power broadcasts, AI replies and voice calls.", detail: "Add demo credits to explore billing controls. Live payments are not enabled in this starter project.", time: "~1 min" },
  { id: "agent", title: "Build a chatbot or AI agent", description: "Auto-answer customers 24×7 with flows or an AI agent.", detail: "Define your agent's role, connect a knowledge source, and route complex questions to a human teammate.", time: "~8 min" },
  { id: "broadcast", title: "Send your first broadcast", description: "Pick an approved template and reach your contacts.", detail: "Schedule a test campaign for a small audience before sending to your full contact list.", time: "~2 min" },
] as const;

export const activityItems = [
  { id: 1, icon: "message", title: "WhatsApp campaign delivered", detail: "Autumn product update · 1,248 recipients", time: "12 min ago" },
  { id: 2, icon: "user", title: "New contact added", detail: "Maya Patel from Northstar Studio", time: "38 min ago" },
  { id: 3, icon: "bot", title: "AI assistant resolved a conversation", detail: "Billing question · no handoff needed", time: "1 hr ago" },
  { id: 4, icon: "deal", title: "Deal moved to negotiation", detail: "Customer support automation · ₹48,000", time: "2 hrs ago" },
];

export const navigationGroups = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", href: "/", icon: "layout", badge: "" },
      { label: "Contacts", href: "/contacts", icon: "users", badge: "10" },
      { label: "Deals", href: "/deals", icon: "briefcase", badge: "₹" },
      { label: "Campaigns", href: "/campaigns", icon: "send", badge: "" },
      { label: "Analytics", href: "/analytics", icon: "chart", badge: "" },
    ],
  },
  {
    label: "Channels",
    items: [
      { label: "WhatsApp", href: "/whatsapp", icon: "message", badge: "" },
      { label: "SMS", href: "/sms", icon: "sms", badge: "" },
      { label: "RCS", href: "/rcs", icon: "layers", badge: "" },
      { label: "Email", href: "/email", icon: "mail", badge: "" },
      { label: "AI Voice", href: "/voice", icon: "phone", badge: "" },
    ],
  },
  {
    label: "AI & Automation",
    items: [
      { label: "Chatbot & Agents", href: "/chatbot", icon: "bot", badge: "NEW" },
      { label: "Templates", href: "/templates", icon: "file", badge: "" },
      { label: "Integrations", href: "/integrations", icon: "plug", badge: "" },
    ],
  },
];

export const routeMeta: Record<string, { title: string; subtitle: string; eyebrow: string }> = {
  overview: { title: "Your customer workspace, at a glance", subtitle: "Track engagement, discover what's working, and keep every customer conversation moving.", eyebrow: "Workspace overview" },
  contacts: { title: "Contacts", subtitle: "Keep customer profiles, channel preferences, and engagement status in one place.", eyebrow: "Relationship management" },
  deals: { title: "Deals pipeline", subtitle: "Follow every opportunity from first conversation through to a closed deal.", eyebrow: "Sales workspace" },
  campaigns: { title: "Campaigns", subtitle: "Plan, launch, and review targeted messages across your connected channels.", eyebrow: "Campaign studio" },
  analytics: { title: "Analytics & insights", subtitle: "Understand reach, engagement, and customer response across the workspace.", eyebrow: "Performance" },
  whatsapp: { title: "WhatsApp channel", subtitle: "Manage conversations and prepare customer messaging experiences for WhatsApp.", eyebrow: "Messaging channel" },
  sms: { title: "SMS channel", subtitle: "Create concise, timely messages for customers wherever they are.", eyebrow: "Messaging channel" },
  rcs: { title: "RCS messaging", subtitle: "Explore richer, branded mobile conversations with interactive message experiences.", eyebrow: "Messaging channel" },
  email: { title: "Email channel", subtitle: "Keep customer announcements and lifecycle messaging organized in one workspace.", eyebrow: "Messaging channel" },
  voice: { title: "AI voice", subtitle: "Design helpful voice experiences with clear escalation to your team.", eyebrow: "Voice automation" },
  chatbot: { title: "Chatbot & AI agents", subtitle: "Shape support and sales assistants that answer quickly and hand off when needed.", eyebrow: "AI automation" },
  templates: { title: "Message templates", subtitle: "Build reusable, on-brand messages for every channel and audience.", eyebrow: "Content library" },
  integrations: { title: "Integrations", subtitle: "Connect the tools your team already uses to keep customer data in sync.", eyebrow: "Connected workspace" },
  settings: { title: "Workspace settings", subtitle: "Manage preferences and the appearance of your OrbitFlow workspace.", eyebrow: "Preferences" },
  help: { title: "Help & support", subtitle: "Find guidance, explore tutorials, or send a note to the support team.", eyebrow: "We're here to help" },
  support: { title: "Help & support", subtitle: "Find guidance, explore tutorials, or send a note to the support team.", eyebrow: "We're here to help" },
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}
