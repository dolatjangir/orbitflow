export const channelContribution = [
  { name: "WhatsApp", value: 58, color: "var(--primary)" },
  { name: "Email", value: 24, color: "var(--accent)" },
  { name: "SMS", value: 12, color: "#5e9de8" },
  { name: "RCS & Voice", value: 6, color: "#b48ce6" },
] as const;

export const analyticsSummary = {
  messagesSent: "48,296",
  delivered: "47,427",
  engagedAudience: "15,270",
  conversionsAttributed: "1,284",
  overallChange: "+18.6%",
} as const;


export const overviewStats = [
  { label: "Total contacts", value: "12,840", change: "+12.8%", direction: "up", note: "vs. previous 30 days", icon: "Users", series: "0,22 10,17 20,20 30,10 40,15 50,8 60,11 70,2 80,6" },
  { label: "Messages delivered", value: "48,296", change: "+8.4%", direction: "up", note: "delivery rate 98.2%", icon: "Send", series: "0,20 10,22 20,13 30,18 40,8 50,13 60,4 70,9 80,1" },
  { label: "Engagement rate", value: "31.6%", change: "−2.1%", direction: "down", note: "across all channels", icon: "TrendingUp", series: "0,3 10,7 20,4 30,10 40,12 50,9 60,18 70,16 80,23" },
  { label: "Open opportunities", value: "₹2.4L", change: "+16.2%", direction: "up", note: "weighted pipeline value", icon: "BriefcaseBusiness", series: "0,24 10,18 20,21 30,14 40,12 50,16 60,7 70,10 80,1" },
] as const;
