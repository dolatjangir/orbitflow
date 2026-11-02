"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Ban, Check, CheckCheck, ImagePlus, Info, Mail, MessageSquare, Paperclip, Send, Smile, Star, Tag, X } from "lucide-react";
import { Avatar, type ChatProps, dayKey, dateLabel, timeLabel, FIELD, ICON_BUTTON } from "./inbox.shared";

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

export default InboxChat;
