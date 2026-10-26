export type Contact = {
  id: string;
  name: string;
  email: string;
  company: string;
  channel: string;
  status: "Active" | "Engaged" | "Inactive";
  added: string;
};
