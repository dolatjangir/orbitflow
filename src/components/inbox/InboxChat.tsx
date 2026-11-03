"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import {
  ArrowLeft,
  Ban,
  Check,
  CheckCheck,
  FileText,
  ImagePlus,
  Info,
  Mail,
  MapPin,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  Send,
  Smile,
  Star,
  Tag,
  Video,
  X,
  Crosshair,
  LoaderCircle,
  BarChart3,
  ClipboardList,
} from "lucide-react";
import {
  Avatar,
  type ChatProps,
  type InboxMessage,
  dayKey,
  dateLabel,
  timeLabel,
  FIELD,
  ICON_BUTTON,
 type WhatsAppSpecialPayload,
} from "./inbox.shared";
import WhatsAppTemplatePicker from "../WhatsappTemplatePicker";

type ComposerView = "chat" | "poll" | "location";
type PickKind = "media" | "document";

type PlaceResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

type SelectedPlace = {
  lat: string;
  lng: string;
  name: string;
};

const ATTACH_OPTIONS = [
  {
    key: "media" as const,
    label: "Photos & videos",
    description: "Share images or clips",
    icon: ImagePlus,
  },
  {
    key: "document" as const,
    label: "Document",
    description: "PDF, Word, Excel and more",
    icon: FileText,
  },
  {
    key: "poll" as const,
    label: "Poll",
    description: "Ask a question and collect votes",
    icon: BarChart3,
  },
  {
    key: "location" as const,
    label: "Location",
    description: "Share a place or your GPS location",
    icon: MapPin,
  },
  {
    key: "template" as const,
    label: "Template",
    description: "Send a saved WhatsApp template",
    icon: ClipboardList,
  },
];

const WHATSAPP_EMOJIS = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", 
  "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", 
  "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", 
  "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", 
  "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", 
  "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", 
  "💀", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "👋", "🤚", 
  "🖐", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", 
  "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", 
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", 
  "💘", "💝", "✅", "🎉", "🔥", "✨", "💯"
];

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function InboxChat({
  conversation,
  onSend,
  onSendWhatsAppSpecial,
  onWhatsAppRefresh,
  onToggleStar,
  onAddTag,
  onShowContact,
  onBack,
  localMode = false,
  selectedCustomerCount = 0,
  selectedCustomerIds = [],
  onClearCustomerSelection,
}: ChatProps) {
  const [draft, setDraft] = useState("");
  const [emailTo, setEmailTo] = useState(conversation?.contact ?? "");
  const [subject, setSubject] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [composerView, setComposerView] = useState<ComposerView>("chat");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [attempted, setAttempted] = useState(false);

  // Poll composer
  const [pollName, setPollName] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollSelectable, setPollSelectable] = useState(1);

  // Location composer
  const [locQuery, setLocQuery] = useState("");
  const [locResults, setLocResults] = useState<PlaceResult[]>([]);
  const [locSearching, setLocSearching] = useState(false);
  const [location, setLocation] = useState<SelectedPlace | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");

  const messageListRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const isEmail = conversation?.channel === "email";
  const isWhatsApp = conversation?.channel === "baileys";
  const validPollOptions = useMemo(
    () => pollOptions.map((option) => option.trim()).filter(Boolean),
    [pollOptions],
  );
  const selectedFile = files[0] ?? null;
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setEmailTo(conversation?.contact ?? "");
  }, [conversation?.id, conversation?.contact]);

  useEffect(() => {
    const element = messageListRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [conversation?.id, conversation?.messages.length]);

  useEffect(() => {
    if (!selectedFile?.type.startsWith("image/")) {
      setSelectedFilePreview(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setSelectedFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    if (composerView !== "location" || !locQuery.trim() || location) {
      setLocResults([]);
      setLocSearching(false);
      return;
    }

    let cancelled = false;
    setLocSearching(true);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(locQuery.trim())}`,
        );
        if (!response.ok) throw new Error("Location search failed.");
        const data = await response.json();
        if (!cancelled) {
          setLocResults(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) setLocResults([]);
      } finally {
        if (!cancelled) setLocSearching(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [locQuery, composerView, location]);

  const resetSpecialComposer = () => {
    setComposerView("chat");
    setPollName("");
    setPollOptions(["", ""]);
    setPollSelectable(1);
    setLocQuery("");
    setLocResults([]);
    setLocation(null);
    setLocError("");
    setAttempted(false);
    setError("");
  };

  const resetAttachment = () => {
    setFiles([]);
    setDraft("");
    resetSpecialComposer();
  };

  const pickFile = (kind: PickKind) => {
    setShowAttachMenu(false);

    window.requestAnimationFrame(() => {
      const input = fileRef.current;
      if (!input) return;
      input.accept =
        kind === "media"
          ? "image/*,video/*"
          : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt";
      input.value = "";
      input.click();
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    if (!picked.length) return;

    setFiles(
      isWhatsApp
        ? picked.slice(0, 1)
        : [...files, ...picked],
    );
    setShowAttachMenu(false);
    setComposerView("chat");
    setError("");
    setAttempted(false);
    event.target.value = "";
  };

  const handleAttachOption = (key: (typeof ATTACH_OPTIONS)[number]["key"]) => {
    if (key === "media" || key === "document") {
      pickFile(key);
      return;
    }

    setShowAttachMenu(false);
    setError("");
    setAttempted(false);
    setFiles([]);

    if (key === "template") {
      setShowTemplates(true);
      return;
    }

    setComposerView(key);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Location access is not available on this device.");
      return;
    }

    setLocating(true);
    setLocError("");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        let name = "Current location";
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`,
          );
          const data = await response.json();
          if (data?.display_name) name = data.display_name;
        } catch {
          // Keep the GPS coordinates with the fallback label.
        }

        setLocation({
          lat: String(coords.latitude),
          lng: String(coords.longitude),
          name,
        });
        setLocQuery(name);
        setLocResults([]);
        setLocating(false);
      },
      () => {
        setLocError(
          "Couldn't access your location. Allow access, or search for a place instead.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const canSubmit = (() => {
    if (
  !conversation ||
  (conversation.blocked &&
    !(isWhatsApp && selectedCustomerCount > 0)) ||
  sending
) {
  return false;
}

    if (composerView === "poll") {
      return (
        isWhatsApp &&
        !!onSendWhatsAppSpecial &&
        pollName.trim().length > 0 &&
        validPollOptions.length >= 2
      );
    }

    if (composerView === "location") {
      return isWhatsApp && !!onSendWhatsAppSpecial && !!location;
    }

    if (isEmail) {
      return (
        (draft.trim().length > 0 || files.length > 0) &&
       /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo.trim()) &&
        subject.trim().length > 0
      );
    }

    return draft.trim().length > 0 || files.length > 0;
  })();

  async function submit(event?: FormEvent) {
    event?.preventDefault();

    if (
  !conversation ||
  (conversation.blocked &&
    !(isWhatsApp && selectedCustomerCount > 0)) ||
  sending
) {
  return false;
}

    if (composerView === "poll" || composerView === "location") {
      setAttempted(true);
      if (!canSubmit) return;

      if (!onSendWhatsAppSpecial) {
        setError("WhatsApp attachment sending is not configured.");
        return;
      }

      const payload: WhatsAppSpecialPayload =
        composerView === "poll"
          ? {
              mediaType: "poll",
              poll: {
                name: pollName.trim(),
                options: validPollOptions,
                selectableCount: pollSelectable,
              },
            }
          : {
              mediaType: "location",
              location: location!,
            };

      setSending(true);
      setError("");
      try {
        await onSendWhatsAppSpecial(payload);
        resetSpecialComposer();
        setNotice(
          composerView === "poll"
            ? "Poll sent."
            : "Location sent.",
        );
        await onWhatsAppRefresh?.();
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to send the WhatsApp attachment.",
        );
      } finally {
        setSending(false);
      }
      return;
    }

    if (!canSubmit) {
      setAttempted(true);
      if (isEmail) {
        setError(
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo.trim())
            ? "Enter a valid recipient email address."
            : !subject.trim()
              ? "Enter an email subject."
              : "Enter a message or attach a file.",
        );
      }
      return;
    }

    setSending(true);
    setError("");

    try {
      await onSend(
        draft.trim(),
        files,
        isEmail
          ? { to: emailTo.trim(), subject: subject.trim() }
          : undefined,
      );

      setDraft("");
      setSubject("");
      setFiles([]);
      setShowEmoji(false);
      setNotice("");
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

 const handleTemplateSent = async (message?: string) => {
  setShowTemplates(false);
  setNotice(message || "WhatsApp template sent.");
  setError("");

  onClearCustomerSelection?.();

  await onWhatsAppRefresh?.();
};

  const renderMessageAttachment = (message: InboxMessage) => {
    const attachment = message.attachments?.[0];
    const mediaType = message.mediaType || attachment?.type || "";
    const url = attachment?.url;

    if (mediaType === "image" || mediaType === "sticker") {
      return url ? (
        <button
          type="button"
          onClick={() => setLightbox(url)}
          className="mt-1 block max-w-full cursor-zoom-in"
          aria-label="Open image"
        >
          <img
            src={url}
            alt={attachment?.name || "WhatsApp image"}
            loading="lazy"
            className="max-h-72 max-w-full rounded-xl object-cover"
          />
        </button>
      ) : (
        <p className="text-xs opacity-75">Image attachment unavailable.</p>
      );
    }

    if (mediaType === "video") {
      return url ? (
        <video
          src={url}
          controls
          preload="metadata"
          className="mt-1 max-h-72 w-full max-w-sm rounded-xl bg-black object-contain"
        />
      ) : (
        <p className="text-xs opacity-75">Video attachment unavailable.</p>
      );
    }

    if (mediaType === "audio") {
      return url ? (
        <audio src={url} controls preload="none" className="mt-1 max-w-full" />
      ) : (
        <p className="text-xs opacity-75">Voice message unavailable.</p>
      );
    }

    if (mediaType === "document") {
      return attachment ? (
        <a
          href={url || undefined}
          target={url ? "_blank" : undefined}
          rel={url ? "noreferrer" : undefined}
          className="mt-1 flex min-w-56 items-center gap-3 rounded-xl border border-current/15 bg-black/5 p-3"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-500/10 text-indigo-500">
            <FileText size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold">
              {attachment.name || "Document"}
            </span>
            <span className="mt-0.5 block text-[10px] opacity-70">
              {url ? "Open document" : "Document link unavailable"}
            </span>
          </span>
        </a>
      ) : null;
    }

    if (mediaType === "location" && message.location) {
      const { lat, lng, name } = message.location;
      return (
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block w-64 max-w-full"
        >
          <iframe
            src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
            loading="lazy"
            title="Shared WhatsApp location"
            className="pointer-events-none h-36 w-full rounded-xl border-0"
          />
          {name && (
            <span className="mt-1 flex items-center gap-1.5 text-xs font-medium">
              <MapPin size={13} className="shrink-0" />
              <span className="truncate">{name}</span>
            </span>
          )}
        </a>
      );
    }

    if (mediaType === "poll" && message.pollOptions?.length) {
      const votes = message.pollVotes || {};
      const voters = Object.values(votes).filter((v) => v.length);
      return (
        <div className="mt-1 w-64 max-w-full">
          <p className="mb-2 text-sm font-semibold">
            {message.text || "WhatsApp poll"}
          </p>
          <div className="space-y-1.5">
            {message.pollOptions.map((option, index) => {
              const count = voters.filter((vote) => vote.includes(option)).length;
              const percent = voters.length
                ? Math.round((count / voters.length) * 100)
                : 0;
              return (
                <div
                  key={`${option}-${index}`}
                  className="relative overflow-hidden rounded-lg bg-black/5 px-2.5 py-2"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-[var(--primary)]/15 transition-all"
                    style={{ width: `${percent}%` }}
                  />
                  <div className="relative flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-xs">
                      {option}
                    </span>
                    {count > 0 && (
                      <span className="text-[11px] font-semibold">{count}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (attachment) {
      return (
        <a
          href={url || undefined}
          target={url ? "_blank" : undefined}
          rel={url ? "noreferrer" : undefined}
          className="mt-1 flex items-center gap-2 rounded-lg border border-current/15 px-3 py-2 text-xs underline"
        >
          <Paperclip size={14} />
          {attachment.name}
        </a>
      );
    }

    return null;
  };

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
            {isEmail ? (
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
                {isWhatsApp ? "WhatsApp" : conversation.online ? "Online" : "Offline"}
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

      {/* Message history */}
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
            !previous || dayKey(previous.createdAt) !== dayKey(message.createdAt);

          return (
            <div key={message.id}>
              {newDay && (
                <div className="mb-5 text-center text-xs font-medium text-[var(--muted)]">
                  {dateLabel(message.createdAt)}
                </div>
              )}

              <div className={`flex flex-col ${outgoing ? "items-end" : "items-start"}`}>
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

                  {message.mediaType === "location" || message.mediaType === "poll" ? (
                    renderMessageAttachment(message) || (
                      message.text ? (
                        <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                          {message.text}
                        </p>
                      ) : null
                    )
                  ) : (
                    <>
                      {renderMessageAttachment(message)}
                      {message.text && (
                        <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                          {message.text}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-1.5 flex items-center gap-1.5 px-1 text-[11px] text-[var(--muted)]">
                  <time dateTime={message.createdAt}>{timeLabel(message.createdAt)}</time>
                  {outgoing && message.status === "local" && <span>· Local preview</span>}
                  {outgoing && message.status === "sent" && <Check size={14} aria-label="Sent" />}
                  {outgoing &&
                    (message.status === "delivered" || message.status === "read") && (
                      <CheckCheck
                        size={16}
                        aria-label={message.status}
                        className={message.status === "read" ? "text-[var(--primary)]" : ""}
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
        className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] p-3"
      >
       {conversation.blocked &&
selectedCustomerCount === 0 ? (
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

            {notice && (
              <p className="mb-2 text-xs text-[var(--success)]">{notice}</p>
            )}
            {isWhatsApp && selectedCustomerCount > 0 && (
  <div className="mb-3 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-3 py-2 text-xs text-[var(--primary)]">
    The same message will be sent to{" "}
    <strong>{selectedCustomerCount}</strong> selected WhatsApp customers.
  </div>
)}

            {composerView === "chat" && files.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex max-w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-2"
                  >
                    {index === 0 && selectedFilePreview ? (
                      <img
                        src={selectedFilePreview}
                        alt=""
                        className="size-11 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                        {file.type.startsWith("video/") ? <Video size={19} /> : <FileText size={19} />}
                      </span>
                    )}

                    <span className="min-w-0">
                      <span className="block max-w-48 truncate text-xs font-semibold">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-[var(--muted)]">
                        {formatBytes(file.size)}
                      </span>
                    </span>

                    <button
                      type="button"
                      disabled={sending}
                      aria-label={`Remove ${file.name}`}
                      onClick={() =>
                        setFiles((current) =>
                          current.filter((_, fileIndex) => fileIndex !== index),
                        )
                      }
                      className={`${ICON_BUTTON} size-7`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {composerView === "poll" && isWhatsApp && (
              <div className="mb-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
                <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold">Create poll</p>
                   <p className="text-[10px] text-[var(--muted)]">
  {selectedCustomerCount > 0
    ? `Sending poll to ${selectedCustomerCount} selected customers`
    : `WhatsApp poll for ${conversation.name}`}
</p>
                  </div>
                  <button type="button" onClick={resetSpecialComposer} className={ICON_BUTTON} aria-label="Back to message composer">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3 p-3">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-[var(--text-soft)]">
                      Question
                    </span>
                    <input
                      value={pollName}
                      onChange={(event) => setPollName(event.target.value)}
                      placeholder="Ask a question"
                      maxLength={255}
                      className={FIELD}
                    />
                  </label>

                  <div>
                    <span className="mb-1.5 block text-xs font-semibold text-[var(--text-soft)]">
                      Options
                    </span>
                    <div className="space-y-2">
                      {pollOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--primary-soft)] text-[10px] font-bold text-[var(--primary)]">
                            {index + 1}
                          </span>
                          <input
                            value={option}
                            onChange={(event) =>
                              setPollOptions((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index ? event.target.value : item,
                                ),
                              )
                            }
                            placeholder={`Option ${index + 1}`}
                            maxLength={100}
                            className={FIELD}
                          />
                          {pollOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() =>
                                setPollOptions((current) =>
                                  current.filter((_, itemIndex) => itemIndex !== index),
                                )
                              }
                              className={ICON_BUTTON}
                              aria-label={`Remove option ${index + 1}`}
                            >
                              <X size={15} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={pollOptions.length >= 12}
                      onClick={() => setPollOptions((current) => [...current, ""])}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] disabled:opacity-40"
                    >
                      <Plus size={14} />
                      Add option
                    </button>
                  </div>

                  <label className="flex items-center gap-2 border-t border-[var(--border)] pt-3 text-xs text-[var(--text-soft)]">
                    <input
                      type="checkbox"
                      checked={pollSelectable > 1}
                      onChange={(event) =>
                        setPollSelectable(
                          event.target.checked
                            ? Math.max(2, validPollOptions.length)
                            : 1,
                        )
                      }
                      className="accent-[var(--primary)]"
                    />
                    Allow multiple answers
                  </label>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border)] px-3 py-2">
                  {attempted && (!pollName.trim() || validPollOptions.length < 2) ? (
                    <span className="text-[11px] text-[var(--danger)]">
                      Add a question and at least two options.
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--muted)]">
                      {validPollOptions.length} option(s)
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => void submit()}
                    disabled={!canSubmit}
                    className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[var(--primary)] px-3 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {sending ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={15} />}
                    Send poll
                  </button>
                </div>
              </div>
            )}

            {composerView === "location" && isWhatsApp && (
              <div className="mb-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
                <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold">Share location</p>
                    <p className="text-[10px] text-[var(--muted)]">
                      Search for a place or use GPS
                    </p>
                  </div>
                  <button type="button" onClick={resetSpecialComposer} className={ICON_BUTTON} aria-label="Back to message composer">
                    <X size={16} />
                  </button>
                </div>

                <div className="p-3">
                  <div className="relative">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                    />
                    <input
                      value={locQuery}
                      onChange={(event) => {
                        setLocQuery(event.target.value);
                        setLocation(null);
                      }}
                      placeholder="Search for a place or address"
                      className={`${FIELD} pl-9`}
                    />
                  </div>

                  {!location && (
                    <button
                      type="button"
                      onClick={useCurrentLocation}
                      disabled={locating}
                      className="mt-2 flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-[var(--surface-3)] disabled:opacity-50"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                        {locating ? <LoaderCircle size={17} className="animate-spin" /> : <Crosshair size={17} />}
                      </span>
                      <span>
                        <span className="block text-xs font-semibold">
                          {locating ? "Finding your location…" : "Send your current location"}
                        </span>
                        <span className="block text-[10px] text-[var(--muted)]">
                          Uses your device GPS
                        </span>
                      </span>
                    </button>
                  )}

                  {locError && <p className="mt-2 text-xs text-[var(--danger)]">{locError}</p>}
                  {locSearching && (
                    <p className="px-2 py-3 text-xs text-[var(--muted)]">Searching places…</p>
                  )}

                  {!location && locResults.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-[var(--border)]">
                      {locResults.map((result) => (
                        <button
                          type="button"
                          key={result.place_id}
                          onClick={() => {
                            setLocation({
                              lat: result.lat,
                              lng: result.lon,
                              name: result.display_name,
                            });
                            setLocQuery(result.display_name);
                            setLocResults([]);
                          }}
                          className="flex w-full items-center gap-2 border-b border-[var(--border)] p-2.5 text-left text-xs last:border-0 hover:bg-[var(--surface-3)]"
                        >
                          <MapPin size={15} className="shrink-0 text-[var(--primary)]" />
                          <span className="min-w-0 truncate">{result.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {location && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                      <iframe
                        title="Selected location preview"
                        src={`https://www.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
                        loading="lazy"
                        className="h-32 w-full border-0"
                      />
                      <div className="flex items-center gap-2 p-3">
                        <MapPin size={16} className="shrink-0 text-[var(--primary)]" />
                        <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                          {location.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setLocation(null);
                            setLocQuery("");
                          }}
                          className={ICON_BUTTON}
                          aria-label="Remove selected location"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border)] px-3 py-2">
                  <span className="text-[11px] text-[var(--muted)]">
                    {location ? "Location ready to send" : "Choose a location to continue"}
                  </span>
                  <button
                    type="button"
                    onClick={() => void submit()}
                    disabled={!canSubmit}
                    className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[var(--primary)] px-3 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {sending ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={15} />}
                    Send location
                  </button>
                </div>
              </div>
            )}

            {composerView === "chat" && (
              <>
                {isEmail && (
                  <div className="mb-3 grid gap-3 @[720px]:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-[var(--text-soft)]">To</span>
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
                      <span className="mb-1.5 block text-xs font-semibold text-[var(--text-soft)]">Subject</span>
                      <input
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
                  multiple={!isWhatsApp}
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="flex items-center gap-1.5">
                  {isWhatsApp ? (
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        className={`${ICON_BUTTON} size-11`}
                        disabled={sending}
                        onClick={() => setShowAttachMenu((current) => !current)}
                        aria-label="Open WhatsApp attachments"
                        aria-expanded={showAttachMenu}
                      >
                        <Plus
                          size={21}
                          className={`transition-transform ${showAttachMenu ? "rotate-45" : ""}`}
                        />
                      </button>

                      {showAttachMenu && (
                        <>
                          <button
                            type="button"
                            aria-label="Close attachment menu"
                            onClick={() => setShowAttachMenu(false)}
                            className="fixed inset-0 z-40 cursor-default"
                          />
                          <div className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
                            {ATTACH_OPTIONS.map((option) => {
                              const Icon = option.icon;
                              return (
                                <button
                                  type="button"
                                  key={option.key}
                                  onClick={() => handleAttachOption(option.key)}
                                  className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left hover:bg-[var(--surface-2)]"
                                >
                                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                                    <Icon size={17} />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-xs font-semibold">{option.label}</span>
                                    <span className="mt-0.5 block truncate text-[10px] text-[var(--muted)]">
                                      {option.description}
                                    </span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={`${ICON_BUTTON} size-11`}
                      disabled={sending}
                      onClick={() => fileRef.current?.click()}
                      aria-label="Attach files"
                    >
                      <Paperclip size={19} />
                    </button>
                  )}

                  <button
                    type="button"
                    className={`${ICON_BUTTON} size-11`}
                    disabled={sending}
                    onClick={() => setShowEmoji((current) => !current)}
                    aria-label="Choose emoji"
                    aria-expanded={showEmoji}
                  >
                    <Smile size={19} />
                  </button>

                  {!isWhatsApp && (
                    <button
                      type="button"
                      className={`${ICON_BUTTON} hidden size-11 @[900px]:inline-flex`}
                      disabled={sending}
                      onClick={() => {
                        if (fileRef.current) {
                          fileRef.current.accept = "image/*";
                          fileRef.current.click();
                        }
                      }}
                      aria-label="Attach images"
                    >
                      <ImagePlus size={19} />
                    </button>
                  )}

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
                      placeholder={
                        isEmail
                          ? "Write your email..."
                          : selectedFile
                            ? "Add a caption..."
                            : "Type a message..."
                      }
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
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
                      maxLength={isWhatsApp ? 1024 : undefined}
                      className={`${FIELD} w-full resize-none bg-[var(--surface)] ${
                        isEmail ? "min-h-24 max-h-40" : "min-h-11 max-h-28"
                      }`}
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    aria-label={sending ? "Sending message" : "Send message"}
                    className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-strong)] disabled:opacity-50"
                  >
                    {sending ? <LoaderCircle size={19} className="animate-spin" /> : <Send size={19} />}
                  </button>
                </div>

                {showEmoji && (
                  <div className="mt-2 flex flex-wrap gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 max-h-60 overflow-y-auto [scrollbar-width:thin]">
                    {WHATSAPP_EMOJIS.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-[var(--surface-3)] text-[22px]"
                        onClick={() => {
                          setDraft((current) => current + emoji);
                          composerRef.current?.focus();
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {error && (
              <p role="alert" className="mt-2 text-xs text-[var(--danger)]">
                {error}
              </p>
            )}
            {attempted && composerView === "chat" && !draft.trim() && files.length === 0 && (
              <p className="mt-1 text-[11px] text-[var(--danger)]">
                Enter a message or attach a file.
              </p>
            )}
          </>
        )}
      </form>

      {lightbox && (
        <div
          className="fixed inset-0 z-[120] flex cursor-zoom-out items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
          role="presentation"
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
            onClick={() => setLightbox(null)}
            aria-label="Close image preview"
          >
            <X size={20} />
          </button>
          <img
            src={lightbox}
            alt="WhatsApp attachment preview"
            className="max-h-[92vh] max-w-[92vw] object-contain"
          />
        </div>
      )}

      {isWhatsApp && (
        <WhatsAppTemplatePicker
          isOpen={showTemplates}
          onClose={() => setShowTemplates(false)}
          targetIds={
  selectedCustomerIds.length > 0
    ? selectedCustomerIds
    : [conversation.id]
}
          onSent={(message) => void handleTemplateSent(message)}
        />
      )}
    </div>
  );
}

export default InboxChat;