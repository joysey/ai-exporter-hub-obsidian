import { ConversationIndexItem } from "../models/conversation";
import { ParsedRoute, routeTitle } from "./routing";
import { Icon } from "./Icon";
import { useActions } from "./actions";

interface Props {
  route: ParsedRoute;
  showReader: boolean;
  activeItem?: ConversationIndexItem;
  onToggleSidebar: () => void;
  onTogglePanel: () => void;
  onBack: () => void;
  onRebuild: () => void;
  onSaveKnowledge?: () => void;
}

export function TopBar({
  route,
  showReader,
  activeItem,
  onToggleSidebar,
  onTogglePanel,
  onBack,
  onRebuild,
  onSaveKnowledge,
}: Props) {
  const actions = useActions();

  if (showReader && activeItem) {
    return (
      <div className="aikh-topbar aikh-topbar-reader">
        <button className="aikh-icon-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <Icon name="panel-left" />
        </button>
        <button className="aikh-icon-btn" onClick={onBack} aria-label="Back to list">
          <Icon name="arrow-left" />
        </button>
        <div className="aikh-topbar-title">{activeItem.title}</div>
        <div className="aikh-topbar-actions">
          <button
            className={`aikh-pill-btn ${activeItem.favorite ? "is-active" : ""}`}
            onClick={() => {
              void actions.setFavorite(activeItem.filePath, !activeItem.favorite);
            }}
          >
            <Icon name="star" /> Favorite
          </button>
          <button
            className="aikh-pill-btn"
            onClick={() => {
              void actions.openMarkdown(activeItem.filePath);
            }}
          >
            <Icon name="square-arrow-out-up-right" /> Open Markdown file
          </button>
          {onSaveKnowledge && (
            <button className="aikh-pill-btn" onClick={onSaveKnowledge}>
              <Icon name="lightbulb" /> Save knowledge note
            </button>
          )}
          <button className="aikh-icon-btn" onClick={onTogglePanel} aria-label="Toggle panel">
            <Icon name="panel-right" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="aikh-topbar">
      <button className="aikh-icon-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
        <Icon name="panel-left" />
      </button>
      <div className="aikh-topbar-title">{routeTitle(route)}</div>
      <div className="aikh-topbar-actions">
        <button className="aikh-icon-btn" onClick={onRebuild} aria-label="Rebuild index">
          <Icon name="refresh-cw" />
        </button>
      </div>
    </div>
  );
}
