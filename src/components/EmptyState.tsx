interface Props {
  kind: string;
  message?: string;
}

const MESSAGES: Record<string, { title: string; body: string }> = {
  inbox: {
    title: "Inbox zero 🎉",
    body: "All imported conversations have been reviewed.",
  },
  project: {
    title: "No conversations in this project yet",
    body: "Assign a project to a conversation to see it here.",
  },
  category: {
    title: "Nothing here yet",
    body: "Assign this category to a conversation to see it here.",
  },
  favorites: {
    title: "No favorites yet",
    body: "Star a conversation to keep it close.",
  },
  search: {
    title: "No matching conversations",
    body: "Try removing filters or searching another phrase.",
  },
  rediscover: {
    title: "Nothing to rediscover yet",
    body: "Older favorites and conversations will resurface here over time.",
  },
  reviewed: {
    title: "Nothing reviewed yet",
    body: "Mark conversations as reviewed and they will show up here.",
  },
  recent: {
    title: "No recent conversations",
    body: "Add compatible conversation Markdown files to get started.",
  },
  default: {
    title: "No conversations found",
    body: "Add compatible conversation Markdown files to the selected folder.",
  },
};

export function EmptyState({ kind, message }: Props) {
  const m = MESSAGES[kind] ?? MESSAGES.default;
  return (
    <div className="aikh-empty">
      <div className="aikh-empty-title">{m.title}</div>
      <div className="aikh-empty-body">{message ?? m.body}</div>
    </div>
  );
}
