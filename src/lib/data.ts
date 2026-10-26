// Backwards-compatible exports. New code should import from @/data, @/types, and @/lib/format.
export type { Contact } from "@/types/contact";
export type { Deal } from "@/types/deal";
export { initialContacts } from "@/data/contacts";
export { initialDeals } from "@/data/deals";
export { onboardingSteps } from "@/data/onboarding";
export { activityItems } from "@/data/activity";
export { navigationGroups } from "@/data/navigation";
export { routeMeta } from "@/data/route-meta";
export { formatCurrency } from "@/lib/format";
