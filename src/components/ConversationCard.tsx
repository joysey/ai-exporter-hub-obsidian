import { ConversationIndexItem } from "../models/conversation";
import { formatDate } from "../utils/dates";
import { recencyTimestamp } from "../utils/conversation";
import { Icon } from "./Icon";
import { PlatformBadge } from "./Badge";
import { useActions } from "./actions";

interface Props {
  item: ConversationIndexItem;
  snippet?: string;
  onOpen: (path: string) => void;
}

export function ConversationCard({ item, snippet, onOpen }: Props) {
  const actions = useActions();

  const meta = [item.project, item.category].filter(Boolean).join(" · ");
  const date = formatDate(recencyTimestamp(item));

  return (
    <div className="aikh-card" onClick={() => onOpen(item.filePath)} role="button" tabIndex={0}>
      <PlatformBadge platform={item.platform} size={34} />
      <div className="aikh-card-main">
        <div className="aikh-card-title">
          {item.status === "inbox" && <span className="aikh-dot" title="Inbox" />}
          {item.title}
        </div>
        <div className="aikh-card-meta">
          <span className="aikh-card-platform">{item.platform}</span>
          {meta && <span>{meta}</span>}
          {date && <span className="aikh-card-date">{date}</span>}
        </div>
        {snippet && <div className="aikh-card-snippet">{snippet}</div>}
        {item.tags.length > 0 && (
          <div className="aikh-card-tags">
            {item.tags.slice(0, 5).map((t) => (
              <span key={t} className="aikh-tag">#{t}</span>
            ))}
          </div>
        )}
      </div>
      <div className="aikh-card-actions">
        <button
          className={`aikh-icon-btn ${item.favorite ? "is-active" : ""}`}
          aria-label="Favorite"
          onClick={(e) => {
            e.stopPropagation();
            void actions.setFavorite(item.filePath, !item.favorite);
          }}
        >
          <Icon name="star" />
        </button>
      </div>
    </div>
  );
}
