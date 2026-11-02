"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export type InboxChannel = "baileys" | "meta" | "email";

export type InboxAttachment = {
  name: string;
  size: number;
  url?: string;
};

export type InboxMessage = {
  id: string;
  text: string;
  subject?: string;
  direction: "incoming" | "outgoing";
  createdAt: string;
  status?: "local" | "sent" | "delivered" | "read";
  attachments?: InboxAttachment[];
};

export type InboxConversation = {
  id: string;
  channel: InboxChannel;
  name: string;
  contact: string;
  about: string;
  online: boolean;
  unread: number;
  starred: boolean;
  blocked: boolean;
  tags: string[];
  assignedTo: string;
  notes: string[];
  createdAt: string;
  messages: InboxMessage[];
};

export type SendMessageInput = {
  conversationId: string;
  channel: InboxChannel;
  subject?: string;
  recipient: string;
  text: string;
  files: File[];
};

/**
 * Return your server-confirmed message after successful delivery/submission.
 * Throw an Error when the request fails.
 */
export type SendMessageHandler = (
  input: SendMessageInput,
) => Promise<InboxMessage>;

export type InboxWorkspaceProps = {
  initialConversations?: InboxConversation[];
  onSendMessage?: SendMessageHandler;
};

export type ChatProps = {
  conversation: InboxConversation | null;
onSend: (
  text: string,
  files: File[],
  email?: { to: string; subject: string },
) => Promise<void>;
  onToggleStar: () => void;
  onAddTag: () => void;
  onShowContact: () => void;
  onBack: () => void;
  localMode?: boolean;
};

export type ModalKind = "new" | "tag" | "assign" | "note" | "profile" | null;

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

export const CHANNELS = [
  {
    id: "baileys" as const,
    title: "Baileys WhatsApp",
    description: "Self-hosted WhatsApp",
  },
  {
    id: "meta" as const,
    title: "Meta WhatsApp",
    description: "Official Business API",
  },
  {
    id: "email" as const,
    title: "Email",
    description: "Email Conversations",
  },
];

export const ICON_BUTTON =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg " +
  "text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] " +
  "hover:text-[var(--text)] focus-visible:outline-2 " +
  "focus-visible:outline-[var(--primary)]";

export const FIELD =
  "w-full rounded-xl border border-[var(--border)] " +
  "bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--text)] " +
  "outline-none placeholder:text-[var(--muted)] " +
  "focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]";

export const OUTLINE_BUTTON =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg " +
  "border border-[var(--border)] px-3 py-2 text-xs font-semibold " +
  "text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]";

export const PRIMARY_BUTTON =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg " +
  "bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white " +
  "transition-colors hover:bg-[var(--primary-strong)] " +
  "disabled:cursor-not-allowed disabled:opacity-50";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

export function channelName(channel: InboxChannel) {
  return CHANNELS.find((item) => item.id === channel)?.title ?? channel;
}

export function lastActivity(conversation: InboxConversation) {
  return (
    conversation.messages[conversation.messages.length - 1]?.createdAt ??
    conversation.createdAt
  );
}

export function timeLabel(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function dayKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function preview(conversation: InboxConversation) {
  const last = conversation.messages[conversation.messages.length - 1];

  if (!last) return "Start a conversation";
  return last.text || last.attachments?.[0]?.name || "Attachment";
}

/* Sample data only; pass your API data through initialConversations. */
export function createDemoConversations(): InboxConversation[] {
  const people = [
    ["John Smith", "That sounds great! Do you have a demo available?"],
    ["Sarah Wilson", "Can you share more details?"],
    ["Michael Brown", "Thank you for the update!"],
    ["Emily Davis", "Is this still available?"],
    ["Robert Johnson", "Great, I'll check and get back."],
    ["Lisa Anderson", "Do you have a demo?"],
    ["David Lee", "Perfect, thanks!"],
    ["Jennifer Taylor", "Looking forward to it."],
  ];

  return CHANNELS.flatMap((channel, channelIndex) =>
    people.slice(0, channel.id === "meta" ? 8 : 3).map(([name, text], index) => {
      const conversationId = `${channel.id}-${index}`;
      const createdAt = "2026-10-25T09:00:00Z";
      const latest = `2026-10-31T${String(10 - Math.min(index, 7)).padStart(
        2,
        "0",
      )}:24:00Z`;

      const messages: InboxMessage[] =
        index === 0
          ? [
              {
                id: `${conversationId}-1`,
                direction: "incoming",
                text:
                  "Hi, I'm interested in your AI solutions.\n" +
                  "Can you tell me more about your services?",
                createdAt: "2026-10-31T10:20:00Z",
              },
              {
                id: `${conversationId}-2`,
                direction: "outgoing",
                text:
                  "Hello John! 👋\n\n" +
                  "Thank you for your interest in our AI solutions. " +
                  "We offer AI automation, AI agents, and custom AI workforce " +
                  "solutions to help businesses grow efficiently.",
                createdAt: "2026-10-31T10:22:00Z",
                status: "read",
              },
              {
                id: `${conversationId}-3`,
                direction: "incoming",
                text,
                createdAt: latest,
              },
            ]
          : [
              {
                id: `${conversationId}-1`,
                direction: "incoming",
                text,
                createdAt: latest,
              },
            ];

      return {
        id: conversationId,
        channel: channel.id,
        name,
        contact:
          channel.id === "email"
            ? `${name.toLowerCase().replaceAll(" ", ".")}@example.com`
            : `+1 202 555 ${String(100 + channelIndex * 10 + index).padStart(
                4,
                "0",
              )}`,
        about: "Interested in AI automation solutions for their business.",
        online: index === 0,
        unread: index === 0 ? 3 : index === 1 || index === 5 ? 1 : 0,
        starred: false,
        blocked: false,
        tags: index === 0 ? ["Lead", "AI Solutions", "Demo"] : ["Lead"],
        assignedTo: "",
        notes: [],
        createdAt,
        messages,
      };
    }),
  );
}

export function Avatar({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  return (
    <div
      className={[
        "grid shrink-0 place-items-center rounded-full",
        "bg-[var(--primary-soft)] font-bold text-[var(--primary)]",
        large ? "size-16 text-2xl" : "size-11 text-base",
      ].join(" ")}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}

/* Native dialog supplies focus containment, Escape handling and modality. */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();

    return () => {
      dialog?.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="
        fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-32px)] max-w-md
        overflow-y-auto rounded-2xl border border-[var(--border)]
        bg-[var(--surface)] p-0 text-[var(--text)]
        shadow-[var(--shadow)] backdrop:bg-black/50
      "
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <h2 className="text-base font-bold">{title}</h2>

        <button
          type="button"
          onClick={onClose}
          className={ICON_BUTTON}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-5">{children}</div>
    </dialog>
  );
}

