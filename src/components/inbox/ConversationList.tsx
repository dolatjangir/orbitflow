"use client";

import { Filter, Search, Star } from "lucide-react";
import { Avatar, type InboxConversation, lastActivity, preview, timeLabel, FIELD, ICON_BUTTON } from "./inbox.shared";

type ConversationListProps = {
  channelConversations: InboxConversation[];
  visibleConversations: InboxConversation[];
  selectedId: string | null;
  mobileChat: boolean;
  search: string;
  setSearch: (value: string) => void;
  unreadOnly: boolean;
  setUnreadOnly: (updater: (value: boolean) => boolean) => void;
  selectConversation: (conversation: InboxConversation) => void;
  multiSelectEnabled: boolean;
selectedCustomerIds: Set<string>;
onToggleCustomerSelection: (id: string) => void;
onToggleVisibleCustomers: (ids: string[]) => void;
onClearCustomerSelection: () => void;
};

export default function ConversationList({
  channelConversations,
  visibleConversations,
  selectedId,
  mobileChat,
  search,
  setSearch,
  unreadOnly,
  setUnreadOnly,
  selectConversation,
  multiSelectEnabled,
  selectedCustomerIds,
  onToggleCustomerSelection,
  onToggleVisibleCustomers,
  onClearCustomerSelection,
}: ConversationListProps) {
  return (
    <>
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
                {multiSelectEnabled && (
  <div className="mt-3 flex items-center justify-between gap-2">
    <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--text-soft)]">
      <input
        type="checkbox"
        checked={
          visibleConversations.length > 0 &&
          visibleConversations.every((item) =>
            selectedCustomerIds.has(item.id),
          )
        }
        onChange={() =>
          onToggleVisibleCustomers(
            visibleConversations.map((item) => item.id),
          )
        }
        className="size-4 accent-[var(--primary)]"
      />
      Select all visible ({visibleConversations.length})
    </label>

    {selectedCustomerIds.size > 0 && (
      <button
        type="button"
        onClick={onClearCustomerSelection}
        className="text-xs font-semibold text-[var(--primary)]"
      >
        Clear ({selectedCustomerIds.size})
      </button>
    )}
  </div>
)}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
         {visibleConversations.map((conversation) => {
  const active = selectedId === conversation.id;
  const checked = selectedCustomerIds.has(conversation.id);

  return (
    <div
      key={conversation.id}
      className="flex items-center border-b border-[var(--border)]"
    >
      {multiSelectEnabled && (
        <div className="pl-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={() =>
              onToggleCustomerSelection(conversation.id)
            }
            aria-label={`Select ${conversation.name}`}
            className="size-4 cursor-pointer accent-[var(--primary)]"
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => selectConversation(conversation)}
        aria-current={active ? "true" : undefined}
        className={[
          "flex min-w-0 flex-1 items-center gap-3 border-r-2 px-4 py-3 text-left",
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
    </div>
  );
})}

              {visibleConversations.length === 0 && (
                <p className="px-5 py-10 text-center text-xs text-[var(--muted)]">
                  No conversations match your filters.
                </p>
              )}
            </div>
          </aside>
    </>
  );
}
