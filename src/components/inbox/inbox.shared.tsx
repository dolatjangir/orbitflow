"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export type InboxChannel = "baileys" | "meta" | "email";

export type InboxAttachment = {
  name: string;
  size: number;
  url?: string;
  type?: string;
};

export type InboxLocation = {
  lat: number | string;
  lng: number | string;
  name?: string;
};

export type InboxMessage = {
  id: string;
  text: string;
  subject?: string;
  direction: "incoming" | "outgoing";
  createdAt: string;
  status?: "local" | "sent" | "delivered" | "read";
  attachments?: InboxAttachment[];
  mediaType?: string;
  location?: InboxLocation;
  pollOptions?: string[];
  pollVotes?: Record<string, string[]>;
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

export type WhatsAppSpecialPayload =
  | {
      mediaType: "poll";
      poll: {
        name: string;
        options: string[];
        selectableCount: number;
      };
    }
  | {
      mediaType: "location";
      location: {
        lat: string;
        lng: string;
        name: string;
      };
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
  onSendWhatsAppSpecial?: (
    payload: WhatsAppSpecialPayload,
  ) => Promise<void>;
  onWhatsAppRefresh?: () => Promise<void> | void;
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

  if (last.mediaType && last.mediaType !== "text") {
    const labels: Record<string, string> = {
      image: "Photo",
      video: "Video",
      audio: "Voice message",
      document: "Document",
      location: "Location",
      poll: "Poll",
      sticker: "Sticker",
    };
    return labels[last.mediaType] ?? last.attachments?.[0]?.name ?? "Attachment";
  }

  return last.text || last.attachments?.[0]?.name || "Attachment";
}

/**
 * Kept for backwards compatibility with callers that imported this helper.
 * The outreach inbox must not seed itself with sample conversations.
 */
export function createDemoConversations(): InboxConversation[] {
  return [];
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
