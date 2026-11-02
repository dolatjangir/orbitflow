"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CalendarDays, Mail, MessageCircle, Plus, UserRound, FileText, Ban, MessageSquare, Clock3, X } from "lucide-react";
import InboxChat from "./InboxChat";
import ConversationList from "./ConversationList";
import BaileysConnection from "./BaileysConnection";
import {
  CHANNELS, ICON_BUTTON, FIELD, OUTLINE_BUTTON, PRIMARY_BUTTON, Avatar, Modal,
  createDemoConversations, lastActivity, dateLabel, timeLabel, channelName,
  type InboxChannel, type InboxConversation, type InboxMessage, type InboxWorkspaceProps, type ModalKind,
} from "./inbox.shared";

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
  const [showBaileysConnection, setShowBaileysConnection] = useState(false);

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
                onClick={() => {
                  changeChannel(item.id);
                  if (item.id === "baileys") setShowBaileysConnection(true);
                }}
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
          <ConversationList
            channelConversations={channelConversations}
            visibleConversations={visibleConversations}
            selectedId={selectedId}
            mobileChat={mobileChat}
            search={search}
            setSearch={setSearch}
            unreadOnly={unreadOnly}
            setUnreadOnly={setUnreadOnly}
            selectConversation={selectConversation}
          />

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
      <BaileysConnection
        open={showBaileysConnection}
        onClose={() => setShowBaileysConnection(false)}
      />
    </section>
  );
}