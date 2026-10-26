export type CampaignRecord = { name: string; channel: string; audience: string; status: string; date: string };

export const sampleCampaigns: CampaignRecord[] = [
  { name: "Autumn product update", channel: "WhatsApp", audience: "1,248 contacts", status: "Completed", date: "Oct 23, 2026" },
  { name: "October newsletter", channel: "Email", audience: "4,820 contacts", status: "In review", date: "Oct 22, 2026" },
  { name: "Order follow-up", channel: "SMS", audience: "326 contacts", status: "Completed", date: "Oct 21, 2026" },
];

export const overviewCampaigns = [
  { name: "Autumn product update", channel: "WhatsApp", audience: "1,248 contacts", delivered: "98.2%", status: "Completed", tone: "success" },
  { name: "October newsletter", channel: "Email", audience: "4,820 contacts", delivered: "42.6% open rate", status: "In review", tone: "warning" },
  { name: "Order follow-up", channel: "SMS", audience: "326 contacts", delivered: "96.8%", status: "Completed", tone: "success" },
] as const;
