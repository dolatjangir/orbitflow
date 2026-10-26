import { Mail, MessageCircle, Mic, Smartphone, Layers3 } from "lucide-react";

export const CHANNEL_ACTION_ICON: Record<string, typeof MessageCircle> = {
  WhatsApp: MessageCircle,
  SMS: Smartphone,
  Email: Mail,
  RCS: Layers3,
  Voice: Mic,
};
