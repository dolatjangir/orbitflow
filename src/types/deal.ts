export type Deal = {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: "New lead" | "Qualified" | "Proposal" | "Negotiation" | "Won";
  owner: string;
  closeDate: string;
};
