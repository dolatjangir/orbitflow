"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  Ban,
  CalendarDays,
  Check,
  CheckCheck,
  Clock3,
  FileText,
  Filter,
  ImagePlus,
  Info,
  Mail,
  MessageCircle,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  Send,
  Smile,
  Star,
  Tag,
  UserRound,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

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

type InboxWorkspaceProps = {
  initialConversations?: InboxConversation[];
  onSendMessage?: SendMessageHandler;
};

type ChatProps = {
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

type ModalKind = "new" | "tag" | "assign" | "note" | "profile" | null;

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const CHANNELS = [
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

const ICON_BUTTON =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg " +
  "text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] " +
  "hover:text-[var(--text)] focus-visible:outline-2 " +
  "focus-visible:outline-[var(--primary)]";

const FIELD =
  "w-full rounded-xl border border-[var(--border)] " +
  "bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--text)] " +
  "outline-none placeholder:text-[var(--muted)] " +
  "focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]";

const OUTLINE_BUTTON =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg " +
  "border border-[var(--border)] px-3 py-2 text-xs font-semibold " +
  "text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]";

const PRIMARY_BUTTON =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg " +
  "bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white " +
  "transition-colors hover:bg-[var(--primary-strong)] " +
  "disabled:cursor-not-allowed disabled:opacity-50";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function channelName(channel: InboxChannel) {
  return CHANNELS.find((item) => item.id === channel)?.title ?? channel;
}

function lastActivity(conversation: InboxConversation) {
  return (
    conversation.messages[conversation.messages.length - 1]?.createdAt ??
    conversation.createdAt
  );
}

function timeLabel(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function dayKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function preview(conversation: InboxConversation) {
  const last = conversation.messages[conversation.messages.length - 1];

  if (!last) return "Start a conversation";
  return last.text || last.attachments?.[0]?.name || "Attachment";
}

/* Sample data only; pass your API data through initialConversations. */
function createDemoConversations(): InboxConversation[] {
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

function Avatar({
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
function Modal({
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

/* -------------------------------------------------------------------------- */
/* Reusable chat panel — WhatsApp and email use the same component             */
/* -------------------------------------------------------------------------- */

export function InboxChat({
  conversation,
  onSend,
  onToggleStar,
  onAddTag,
  onShowContact,
  onBack,
  localMode = false,
}: ChatProps) {
  const [draft, setDraft] = useState("");

  const isEmail = conversation?.channel === "email";

const [emailTo, setEmailTo] = useState(conversation?.contact ?? "");
const [subject, setSubject] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const messageListRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = messageListRef.current;

    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [conversation?.id, conversation?.messages.length]);

async function submit(event?: FormEvent) {
  event?.preventDefault();

  if (
    !conversation ||
    conversation.blocked ||
    sending ||
    (!draft.trim() && files.length === 0)
  ) {
    return;
  }

  if (isEmail) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo.trim())) {
      setError("Enter a valid recipient email address.");
      return;
    }

    if (!subject.trim()) {
      setError("Enter an email subject.");
      return;
    }
  }

  setSending(true);
  setError("");

  try {
    await onSend(
      draft.trim(),
      files,
      isEmail
        ? {
            to: emailTo.trim(),
            subject: subject.trim(),
          }
        : undefined,
    );

    setDraft("");
    setSubject("");
    setFiles([]);
    setShowEmoji(false);
  } catch (caught) {
    setError(
      caught instanceof Error
        ? caught.message
        : "Unable to send the message.",
    );
  } finally {
    setSending(false);
  }
}

  if (!conversation) {
    return (
      <div className="grid h-full min-h-0 place-items-center bg-[var(--surface)] p-6 text-center">
        <div>
          <MessageSquare
            size={36}
            className="mx-auto mb-3 text-[var(--primary)]"
          />
          <h2 className="font-semibold">Select a conversation</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Choose a contact to view messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col bg-[var(--surface)]">
      {/* Chat header */}
      <div className="flex min-h-[76px] shrink-0 items-center gap-3 border-b border-[var(--border)] px-4">
        <button
          type="button"
          className={`${ICON_BUTTON} @[720px]:hidden`}
          aria-label="Back to conversations"
          onClick={onBack}
        >
          <ArrowLeft size={19} />
        </button>

        <Avatar name={conversation.name} />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold">{conversation.name}</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--text-soft)]">
            {conversation.channel === "email" ? (
              <>
                <Mail size={12} />
                Email conversation
              </>
            ) : (
              <>
                <span
                  className={`size-2 rounded-full ${
                    conversation.online
                      ? "bg-[var(--success)]"
                      : "bg-[var(--muted)]"
                  }`}
                />
                {conversation.online ? "Online" : "Offline"}
              </>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={onToggleStar}
            className={ICON_BUTTON}
            aria-label="Favorite conversation"
            aria-pressed={conversation.starred}
          >
            <Star
              size={19}
              className={
                conversation.starred
                  ? "fill-[var(--primary)] text-[var(--primary)]"
                  : ""
              }
            />
          </button>

          <button
            type="button"
            onClick={onAddTag}
            className={ICON_BUTTON}
            aria-label="Add tag"
          >
            <Tag size={19} />
          </button>

          <button
            type="button"
            onClick={onShowContact}
            className={ICON_BUTTON}
            aria-label="Show contact information"
          >
            <Info size={19} />
          </button>
        </div>
      </div>

      {/* Only this area scrolls */}
      <div
        ref={messageListRef}
        className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 [scrollbar-width:thin]"
      >
        {conversation.messages.length === 0 && (
          <p className="py-12 text-center text-sm text-[var(--muted)]">
            No messages yet. Start the conversation below.
          </p>
        )}

        {conversation.messages.map((message, index) => {
          const outgoing = message.direction === "outgoing";
          const previous = conversation.messages[index - 1];
          const newDay =
            !previous ||
            dayKey(previous.createdAt) !== dayKey(message.createdAt);

          return (
            <div key={message.id}>
              {newDay && (
                <div className="mb-5 text-center text-xs font-medium text-[var(--muted)]">
                  {dateLabel(message.createdAt)}
                </div>
              )}

              <div
                className={`flex flex-col ${
                  outgoing ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={[
                    "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6",
                    outgoing
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--surface-2)] text-[var(--text)]",
                  ].join(" ")}
                >
                    {isEmail && message.subject && (
  <p className="mb-2 border-b border-current/15 pb-2 text-sm font-bold">
    {message.subject}
  </p>
)}

                  {message.text && (
                    <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                      {message.text}
                    </p>
                  )}

                  {message.attachments?.map((attachment, attachmentIndex) => (
                    <div
                      key={`${attachment.name}-${attachmentIndex}`}
                      className="mt-2 flex items-center gap-2 rounded-lg border border-current/20 px-3 py-2"
                    >
                      <Paperclip size={15} className="shrink-0" />

                      {attachment.url ? (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all underline underline-offset-2"
                        >
                          {attachment.name}
                        </a>
                      ) : (
                        <span className="break-all">{attachment.name}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-1.5 flex items-center gap-1.5 px-1 text-[11px] text-[var(--muted)]">
                  <time dateTime={message.createdAt}>
                    {timeLabel(message.createdAt)}
                  </time>

                  {outgoing && message.status === "local" && (
                    <span>· Local preview</span>
                  )}

                  {outgoing && message.status === "sent" && (
                    <Check size={14} aria-label="Sent" />
                  )}

                  {outgoing &&
                    (message.status === "delivered" ||
                      message.status === "read") && (
                      <CheckCheck
                        size={16}
                        aria-label={message.status}
                        className={
                          message.status === "read"
                            ? "text-[var(--primary)]"
                            : ""
                        }
                      />
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <form
        onSubmit={submit}
        className="shrink-0 border-t border-[var(--border)] p-3"
      >
        {conversation.blocked ? (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-[var(--danger)]">
            <Ban size={17} />
            Contact blocked. Unblock to send messages.
          </div>
        ) : (
          <>
            {localMode && (
              <p className="mb-2 text-[10px] text-[var(--muted)]">
                Preview mode — messages stay in this session.
              </p>
            )}

            {files.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <span
                    key={`${file.name}-${index}`}
                    className="flex max-w-full items-center gap-2 rounded-lg bg-[var(--surface-2)] px-2 py-1 text-xs"
                  >
                    <span className="max-w-40 truncate">{file.name}</span>
                    <button
                      type="button"
                      disabled={sending}
                      aria-label={`Remove ${file.name}`}
                      onClick={() =>
                        setFiles((current) =>
                          current.filter((_, fileIndex) => fileIndex !== index),
                        )
                      }
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {showEmoji && (
              <div className="mb-2 flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-2">
                {["👋", "😊", "👍", "🙏", "✅", "🎉"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="rounded-lg p-2 hover:bg-[var(--surface-3)]"
                    onClick={() => {
                      setDraft((current) => current + emoji);
                      setShowEmoji(false);
                      composerRef.current?.focus();
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-1.5">
                {isEmail && (
  <div className="mb-3 space-y-3">
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[var(--text-soft)]">
        To
      </span>

      <input
        type="email"
        value={emailTo}
        onChange={(event) => setEmailTo(event.target.value)}
        disabled={sending}
        required
        placeholder="recipient@example.com"
        className={FIELD}
      />
    </label>

    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[var(--text-soft)]">
        Subject
      </span>

      <input
        type="text"
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        disabled={sending}
        required
        placeholder="Enter email subject"
        className={FIELD}
      />
    </label>
  </div>
)}
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => {
                  setFiles((current) => [
                    ...current,
                    ...Array.from(event.target.files ?? []),
                  ]);
                  event.target.value = "";
                }}
              />

              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  setFiles((current) => [
                    ...current,
                    ...Array.from(event.target.files ?? []),
                  ]);
                  event.target.value = "";
                }}
              />

              <button
                type="button"
                className={ICON_BUTTON}
                disabled={sending}
                onClick={() => fileRef.current?.click()}
                aria-label="Attach files"
              >
                <Paperclip size={19} />
              </button>

              <button
                type="button"
                className={ICON_BUTTON}
                disabled={sending}
                onClick={() => setShowEmoji((current) => !current)}
                aria-label="Choose emoji"
                aria-expanded={showEmoji}
              >
                <Smile size={19} />
              </button>

              <button
                type="button"
                className={`${ICON_BUTTON} hidden @[900px]:inline-flex`}
                disabled={sending}
                onClick={() => imageRef.current?.click()}
                aria-label="Attach images"
              >
                <ImagePlus size={19} />
              </button>

              <label className="min-w-0 flex-1">
  {isEmail && (
    <span className="mb-1.5 block text-xs font-semibold text-[var(--text-soft)]">
      Message
    </span>
  )}

  <textarea
    ref={composerRef}
    rows={isEmail ? 4 : 1}
    value={draft}
    disabled={sending}
    aria-label={isEmail ? "Email message" : "Message"}
    placeholder={isEmail ? "Write your email..." : "Type a message..."}
    onChange={(event) => setDraft(event.target.value)}
    onKeyDown={(event) => {
      // Email: Enter creates a new line.
      // WhatsApp: Enter sends; Shift+Enter creates a new line.
      if (
        !isEmail &&
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.nativeEvent.isComposing
      ) {
        event.preventDefault();
        void submit();
      }
    }}
    className={`${FIELD} w-full resize-none bg-[var(--surface)] ${
      isEmail ? "min-h-24 max-h-40" : "min-h-11 max-h-28"
    }`}
  />
</label>

              <button
                type="submit"
                disabled={sending || (!draft.trim() && files.length === 0)}
                aria-label={sending ? "Sending message" : "Send message"}
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-strong)] disabled:opacity-50"
              >
                <Send size={19} />
              </button>
            </div>

            {error && (
              <p role="alert" className="mt-2 text-xs text-[var(--danger)]">
                {error}
              </p>
            )}
          </>
        )}
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Inbox workspace                                                            */
/* -------------------------------------------------------------------------- */

export default function InboxWorkspace({
  initialConversations,
  onSendMessage,
}: InboxWorkspaceProps) {
  const [conversations, setConversations] = useState<InboxConversation[]>(
    () => initialConversations ?? createDemoConversations(),
  );

  const [channel, setChannel] = useState<InboxChannel>("meta");

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const initial = initialConversations ?? createDemoConversations();
    return initial.find((item) => item.channel === "meta")?.id ?? null;
  });

  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [dateRange, setDateRange] = useState("all");
  const [filterNow, setFilterNow] = useState(0);
  const [mobileChat, setMobileChat] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [formError, setFormError] = useState("");

  const selected =
    conversations.find((item) => item.id === selectedId) ?? null;

  const channelConversations = conversations.filter(
    (item) => item.channel === channel,
  );

  const visibleConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    const cutoff =
      dateRange === "all"
        ? 0
        : filterNow - Number(dateRange) * 24 * 60 * 60 * 1000;

    return conversations
      .filter((item) => {
        if (item.channel !== channel) return false;
        if (unreadOnly && item.unread === 0) return false;
        if (new Date(lastActivity(item)).getTime() < cutoff) return false;

        const searchable = [
          item.name,
          item.contact,
          ...item.tags,
          ...item.messages.map((message) => message.text),
        ]
          .join(" ")
          .toLowerCase();

        return !query || searchable.includes(query);
      })
      .sort(
        (a, b) =>
          new Date(lastActivity(b)).getTime() -
          new Date(lastActivity(a)).getTime(),
      );
  }, [conversations, channel, search, unreadOnly, dateRange, filterNow]);

  function updateConversation(
    id: string,
    change: Partial<InboxConversation>,
  ) {
    setConversations((current) =>
      current.map((item) => (item.id === id ? { ...item, ...change } : item)),
    );
  }

  function selectConversation(conversation: InboxConversation) {
    setSelectedId(conversation.id);
    setMobileChat(true);
    updateConversation(conversation.id, { unread: 0 });
  }

  function changeChannel(next: InboxChannel) {
    setChannel(next);
    setSearch("");
    setUnreadOnly(false);
    setSelectedId(
      conversations.find((conversation) => conversation.channel === next)?.id ??
        null,
    );
    setMobileChat(false);
    setShowContact(false);
  }

  function openModal(kind: ModalKind) {
    setFormError("");
    setModal(kind);
  }

  async function sendMessage(
  text: string,
  files: File[],
  email?: { to: string; subject: string },
) {
  if (!selected || selected.blocked) {
    throw new Error("This conversation is unavailable.");
  }

  const destination = selected;
  const emailSubject =
    destination.channel === "email" ? email?.subject : undefined;

  const message: InboxMessage = onSendMessage
    ? await onSendMessage({
        conversationId: destination.id,
        channel: destination.channel,
        recipient:
          destination.channel === "email"
            ? email?.to || destination.contact
            : destination.contact,
        subject: emailSubject,
        text,
        files,
      })
    : {
        id: crypto.randomUUID(),
        direction: "outgoing",
        subject: emailSubject,
        text,
        createdAt: new Date().toISOString(),
        status: "local",
        attachments: files.map((file) => ({
          name: file.name,
          size: file.size,
        })),
      };

  setConversations((current) =>
    current.map((item) =>
      item.id === destination.id
        ? {
            ...item,
            messages: [
              ...item.messages,
              {
                ...message,
                subject: message.subject ?? emailSubject,
              },
            ],
          }
        : item,
    ),
  );
}

  function saveModal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = String(form.get("value") ?? "").trim();

    if (modal === "new") {
      const name = String(form.get("name") ?? "").trim();
      const contact = String(form.get("contact") ?? "").trim();
      const nextChannel = String(form.get("channel")) as InboxChannel;

      if (!name || !contact) {
        setFormError("Enter a name and contact.");
        return;
      }

      const existing = conversations.find(
        (item) => item.channel === nextChannel && item.contact === contact,
      );

      if (existing) {
        changeChannel(nextChannel);
        selectConversation(existing);
        setModal(null);
        return;
      }

      const newConversation: InboxConversation = {
        id: crypto.randomUUID(),
        channel: nextChannel,
        name,
        contact,
        about: "",
        online: false,
        unread: 0,
        starred: false,
        blocked: false,
        tags: [],
        assignedTo: "",
        notes: [],
        createdAt: new Date().toISOString(),
        messages: [],
      };

      setConversations((current) => [newConversation, ...current]);
      setChannel(nextChannel);
      setSelectedId(newConversation.id);
      setSearch("");
      setUnreadOnly(false);
      setDateRange("all");
      setMobileChat(true);
      setModal(null);
      return;
    }

    if (!selected || !value) {
      setFormError("Enter a value before saving.");
      return;
    }

    if (modal === "tag") {
      const duplicate = selected.tags.some(
        (tag) => tag.toLowerCase() === value.toLowerCase(),
      );

      if (duplicate) {
        setFormError("This tag already exists.");
        return;
      }

      updateConversation(selected.id, { tags: [...selected.tags, value] });
    }

    if (modal === "assign") {
      updateConversation(selected.id, { assignedTo: value });
    }

    if (modal === "note") {
      updateConversation(selected.id, { notes: [...selected.notes, value] });
    }

    setModal(null);
  }

  const contactPanel = selected ? (
    <div className="space-y-5 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">Contact Information</h2>

        <button
          type="button"
          onClick={() => setShowContact(false)}
          className={`${ICON_BUTTON} @[1180px]:hidden`}
          aria-label="Close contact information"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Avatar name={selected.name} large />

        <div className="min-w-0">
          <h3 className="font-bold">{selected.name}</h3>
          <p className="mt-1 break-all text-xs text-[var(--muted)]">
            {selected.contact}
          </p>

          {selected.channel !== "email" && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--primary-soft)] px-2 py-1 text-[10px] text-[var(--success)]">
              <span
                className={`size-1.5 rounded-full ${
                  selected.online
                    ? "bg-[var(--success)]"
                    : "bg-[var(--muted)]"
                }`}
              />
              {selected.online ? "Online" : "Offline"}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => openModal("profile")}
        className="w-full rounded-lg bg-[var(--primary-soft)] px-3 py-2.5 text-xs font-semibold text-[var(--primary)]"
      >
        View Profile
      </button>

      <div>
        <h3 className="mb-2 text-sm font-bold">About</h3>
        <p className="text-xs leading-5 text-[var(--muted)]">
          {selected.about || "No contact description added."}
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold">Tags</h3>
          <button
            type="button"
            onClick={() => openModal("tag")}
            className="flex items-center gap-1 rounded-md bg-[var(--primary-soft)] px-1.5 py-1 text-[11px] text-[var(--primary)]"
          >
            <Plus size={12} />
            Add Tag
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {selected.tags.map((tag, index) => (
            <span
              key={tag}
              className={[
                "rounded-full px-2.5 py-1 text-[11px]",
                index % 3 === 0
                  ? "bg-amber-500/10 text-amber-600"
                  : index % 3 === 1
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "bg-emerald-500/10 text-[var(--success)]",
              ].join(" ")}
            >
              {tag}
            </span>
          ))}
          {!selected.tags.length && (
            <span className="text-xs text-[var(--muted)]">No tags yet.</span>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold">Conversation Details</h3>

        <dl className="space-y-3 text-[11px]">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-[var(--muted)]" />
            <dt className="text-[var(--muted)]">Channel</dt>
            <dd className="ml-auto text-right">{channelName(selected.channel)}</dd>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-[var(--muted)]" />
            <dt className="text-[var(--muted)]">First Message</dt>
            <dd className="ml-auto">
              {selected.messages[0]
                ? dateLabel(selected.messages[0].createdAt)
                : "—"}
            </dd>
          </div>

          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-[var(--muted)]" />
            <dt className="text-[var(--muted)]">Total Messages</dt>
            <dd className="ml-auto">{selected.messages.length}</dd>
          </div>

          <div className="flex items-center gap-2">
            <Clock3 size={16} className="text-[var(--muted)]" />
            <dt className="text-[var(--muted)]">Last Message</dt>
            <dd className="ml-auto">
              {selected.messages.length ? timeLabel(lastActivity(selected)) : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="border-t border-[var(--border)] pt-4">
        <h3 className="mb-3 text-sm font-bold">Quick Actions</h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => openModal("assign")}
            className={OUTLINE_BUTTON}
          >
            <UserRound size={15} />
            Assign
          </button>

          <button
            type="button"
            onClick={() => openModal("note")}
            className={OUTLINE_BUTTON}
          >
            <FileText size={15} />
            Add Note
          </button>
        </div>

        {selected.assignedTo && (
          <p className="mt-2 break-all text-xs text-[var(--muted)]">
            Assigned to: {selected.assignedTo}
          </p>
        )}

        <button
          type="button"
          onClick={() =>
            updateConversation(selected.id, { blocked: !selected.blocked })
          }
          className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--danger)]/20 bg-[var(--danger)]/5 text-xs text-[var(--danger)]"
        >
          <Ban size={16} />
          {selected.blocked ? "Unblock Contact" : "Block Contact"}
        </button>
      </div>

      {selected.notes.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-bold">Notes</h3>
          <div className="space-y-2">
            {selected.notes.map((note, index) => (
              <p
                key={index}
                className="whitespace-pre-wrap break-words rounded-lg bg-[var(--surface-2)] p-3 text-xs leading-5 text-[var(--text-soft)]"
              >
                {note}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  ) : (
    <p className="p-5 text-sm text-[var(--muted)]">
      Select a conversation to view contact information.
    </p>
  );

  return (
    <section className="@container h-[calc(100dvh-var(--header-height))] min-h-0 w-full min-w-0 bg-[var(--page)] text-[var(--text)]">
      <div className="flex h-full min-h-0 flex-col gap-4 p-3 @[900px]:p-5">
        {/* Page heading */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[28px] leading-tight font-bold tracking-[-0.8px]">
              Inbox
            </h1>
            <p className="mt-1 hidden text-[13px] text-[var(--muted)] @[640px]:block">
              Manage all your conversations from different channels in one place.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
              <CalendarDays size={16} className="text-[var(--muted)]" />
              <select
                aria-label="Filter by last activity"
                value={dateRange}
                onChange={(event) => {
                  setDateRange(event.target.value);
                  setFilterNow(Date.now());
                }}
                className="max-w-28 bg-[var(--surface)] text-xs outline-none"
              >
                <option value="all">All dates</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => openModal("new")}
              className={PRIMARY_BUTTON}
            >
              <Plus size={17} />
              <span className="hidden @[450px]:inline">New Message</span>
            </button>
          </div>
        </div>

        {/* Channel cards */}
        <div className="grid shrink-0 grid-cols-3 gap-2 @[900px]:gap-4">
          {CHANNELS.map((item) => {
            const active = channel === item.id;
            const unread = conversations
              .filter((conversation) => conversation.channel === item.id)
              .reduce((total, conversation) => total + conversation.unread, 0);

            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => changeChannel(item.id)}
                className={[
                  "flex min-w-0 items-center gap-2 rounded-xl border p-2.5 text-left",
                  "@[720px]:gap-3 @[720px]:p-4",
                  active
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] ring-1 ring-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]",
                ].join(" ")}
              >
                <span
                  className={[
                    "hidden size-9 shrink-0 items-center justify-center rounded-full text-white @[640px]:flex",
                    item.id === "email" ? "bg-sky-400" : "bg-green-500",
                  ].join(" ")}
                >
                  {item.id === "email" ? (
                    <Mail size={23} />
                  ) : (
                    <MessageCircle size={24} />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold @[720px]:text-sm">
                    {item.title}
                  </span>
                  <span className="mt-1 hidden truncate text-xs text-[var(--muted)] @[900px]:block">
                    {item.description}
                  </span>
                </span>

                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    active
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--surface-3)] text-[var(--text-soft)]",
                  ].join(" ")}
                >
                  {unread}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main inbox grid */}
        <div className="relative grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] @[720px]:grid-cols-[280px_minmax(0,1fr)] @[1180px]:grid-cols-[300px_minmax(0,1fr)_290px]">
          {/* Conversations */}
          <aside
            className={[
              "min-h-0 flex-col border-r border-[var(--border)]",
              mobileChat ? "hidden @[720px]:flex" : "flex",
            ].join(" ")}
          >
            <div className="shrink-0 p-4 pb-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold">
                  Conversations ({channelConversations.length})
                </h2>

                <button
                  type="button"
                  onClick={() => setUnreadOnly((value) => !value)}
                  aria-label="Show unread conversations only"
                  aria-pressed={unreadOnly}
                  title="Unread conversations only"
                  className={`${ICON_BUTTON} ${
                    unreadOnly
                      ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                      : ""
                  }`}
                >
                  <Filter size={17} />
                </button>
              </div>

              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--muted)]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search conversations..."
                  aria-label="Search conversations"
                  className={`${FIELD} pl-9 text-xs`}
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
              {visibleConversations.map((conversation) => {
                const active = selectedId === conversation.id;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => selectConversation(conversation)}
                    aria-current={active ? "true" : undefined}
                    className={[
                      "flex w-full items-center gap-3 border-r-2 px-4 py-3 text-left",
                      active
                        ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                        : "border-transparent hover:bg-[var(--surface-2)]",
                    ].join(" ")}
                  >
                    <Avatar name={conversation.name} />

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-bold">
                          {conversation.name}
                        </span>

                        <span className="shrink-0 text-[10px] text-[var(--muted)]">
                          {timeLabel(lastActivity(conversation))}
                        </span>
                      </span>

                      <span className="mt-1 flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-xs text-[var(--muted)]">
                          {preview(conversation)}
                        </span>

                        {conversation.starred && (
                          <Star
                            size={12}
                            className="shrink-0 fill-[var(--primary)] text-[var(--primary)]"
                          />
                        )}

                        {conversation.unread > 0 && (
                          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-[10px] text-white">
                            {conversation.unread}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}

              {visibleConversations.length === 0 && (
                <p className="px-5 py-10 text-center text-xs text-[var(--muted)]">
                  No conversations match your filters.
                </p>
              )}
            </div>
          </aside>

          {/* Keep chat instances mounted so drafts survive switching */}
          <div
            className={[
              "min-h-0 min-w-0",
              mobileChat ? "block" : "hidden @[720px]:block",
            ].join(" ")}
          >
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={
                  conversation.id === selectedId ? "h-full min-h-0" : "hidden"
                }
              >
                <InboxChat
                  conversation={conversation}
                  localMode={!onSendMessage}
                  onSend={sendMessage}
                  onToggleStar={() =>
                    updateConversation(conversation.id, {
                      starred: !conversation.starred,
                    })
                  }
                  onAddTag={() => openModal("tag")}
                  onShowContact={() => setShowContact(true)}
                  onBack={() => setMobileChat(false)}
                />
              </div>
            ))}

            {!selected && (
              <div className="grid h-full place-items-center p-5 text-sm text-[var(--muted)]">
                Select a conversation to get started.
              </div>
            )}
          </div>

          {/* Desktop contact panel */}
          <aside className="hidden min-h-0 overflow-y-auto border-l border-[var(--border)] [scrollbar-width:thin] @[1180px]:block">
            {contactPanel}
          </aside>
        </div>
      </div>

      {/* Contact details on smaller screens */}
      {showContact && (
        <Modal
          title="Contact Information"
          onClose={() => setShowContact(false)}
        >
          {contactPanel}
        </Modal>
      )}

      {modal && (
        <Modal
          title={
            modal === "new"
              ? "New Conversation"
              : modal === "tag"
                ? "Add Tag"
                : modal === "assign"
                  ? "Assign Conversation"
                  : modal === "note"
                    ? "Add Note"
                    : "Contact Profile"
          }
          onClose={() => setModal(null)}
        >
          {modal === "profile" && selected ? (
            <div className="space-y-4">
              <Avatar name={selected.name} large />
              <h3 className="text-lg font-bold">{selected.name}</h3>
              <p className="break-all text-sm text-[var(--muted)]">
                {selected.contact}
              </p>
              <p className="text-sm">{selected.about || "No description yet."}</p>
              <p className="text-xs text-[var(--muted)]">
                Channel: {channelName(selected.channel)}
              </p>
              <p className="text-xs text-[var(--muted)]">
                Assigned to: {selected.assignedTo || "Unassigned"}
              </p>
            </div>
          ) : (
            <form onSubmit={saveModal} className="space-y-4">
              {modal === "new" ? (
                <>
                  <label className="block space-y-2 text-xs font-semibold">
                    <span>Channel</span>
                    <select
                      name="channel"
                      defaultValue={channel}
                      className={FIELD}
                    >
                      {CHANNELS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-2 text-xs font-semibold">
                    <span>Contact name</span>
                    <input
                      name="name"
                      required
                      autoFocus
                      className={FIELD}
                      placeholder="Enter contact name"
                    />
                  </label>

                  <label className="block space-y-2 text-xs font-semibold">
                    <span>Email address or phone number</span>
                    <input
                      name="contact"
                      required
                      className={FIELD}
                      placeholder="Email or phone with country code"
                    />
                  </label>
                </>
              ) : (
                <label className="block space-y-2 text-xs font-semibold">
                  <span>
                    {modal === "tag"
                      ? "Tag name"
                      : modal === "assign"
                        ? "Team member name or email"
                        : "Internal note"}
                  </span>

                  {modal === "note" ? (
                    <textarea
                      name="value"
                      required
                      autoFocus
                      rows={4}
                      className={FIELD}
                      placeholder="Write an internal note..."
                    />
                  ) : (
                    <input
                      name="value"
                      required
                      autoFocus
                      defaultValue={
                        modal === "assign" ? selected?.assignedTo : ""
                      }
                      className={FIELD}
                    />
                  )}
                </label>
              )}

              {formError && (
                <p role="alert" className="text-xs text-[var(--danger)]">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className={OUTLINE_BUTTON}
                >
                  Cancel
                </button>
                <button type="submit" className={PRIMARY_BUTTON}>
                  {modal === "new" ? "Start Conversation" : "Save"}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </section>
  );
}