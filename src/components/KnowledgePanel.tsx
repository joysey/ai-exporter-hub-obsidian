import { useMemo, useState } from "react";
import { ConversationIndexItem } from "../models/conversation";
import { findRelated } from "../services/ConversationRepository";
import { formatDate } from "../utils/dates";
import { MetadataEditor } from "./MetadataEditor";
import { KnowledgeNoteModal } from "./KnowledgeNoteModal";
import { useActions } from "./actions";
import { usePlugin } from "./PluginContext";
import { Icon } from "./Icon";
import { PlatformBadge } from "./Badge";

interface Props {
  item: ConversationIndexItem;
  items: ConversationIndexItem[];
  onOpen: (path: string) => void;
}

export function KnowledgePanel({ item, items, onOpen }: Props) {
  const actions = useActions();
  const plugin = usePlugin();
  const [showModal, setShowModal] = useState(false);

  const related = useMemo(() => findRelated(item, items, 5), [item, items]);
  const projects = useMemo(
    () => Array.from(new Set(items.map((i) => i.project).filter(Boolean) as string[])).sort(),
    [items]
  );

  return (
    <div className="aikh-panel-right">
      <div className="aikh-rp-header">
        <Icon name="sparkles" className="aikh-rp-header-icon" />
        <span>Knowledge Panel</span>
      </div>

      <section className="aikh-rp-section">
        <h4><Icon name="file-text" /> Metadata</h4>
        <MetadataEditor item={item} projects={projects} />
        <div className="aikh-rp-facts">
          {item.createdAt && <div><span>Created</span>{formatDate(item.createdAt)}</div>}
          {item.exportedAt && <div><span>Exported</span>{formatDate(item.exportedAt)}</div>}
          {item.tags.length > 0 && (
            <div className="aikh-rp-tags">
              {item.tags.map((t) => <span key={t} className="aikh-tag">#{t}</span>)}
            </div>
          )}
        </div>
      </section>

      <section className="aikh-rp-section">
        <h4><Icon name="link" /> Related Chats</h4>
        {related.length === 0 ? (
          <div className="aikh-panel-empty">No related conversations yet.</div>
        ) : (
          related.map((r) => (
            <div key={r.filePath} className="aikh-related-row" onClick={() => onOpen(r.filePath)} role="button" tabIndex={0}>
              <PlatformBadge platform={r.platform} size={26} />
              <div className="aikh-related-body">
                <div className="aikh-related-title">{r.title}</div>
                <div className="aikh-related-date">{formatDate(r.exportedAt ?? r.updatedAt ?? r.createdAt)}</div>
              </div>
              <Icon name="chevron-right" className="aikh-related-chev" />
            </div>
          ))
        )}
      </section>

      <section className="aikh-rp-section">
        <h4><Icon name="zap" style={{ color: "#f5c542" }} /> Actions</h4>
        <div className="aikh-rp-actions">
          <button className="aikh-cta-gradient" onClick={() => setShowModal(true)}>
            <Icon name="lightbulb" /> Save as Knowledge Note
          </button>
          <button
            className="aikh-rp-action"
            onClick={() => {
              void actions.setStatus(item.filePath, "reviewed");
            }}
          >
            <Icon name="check-circle" /> Mark Reviewed
          </button>
          <button
            className="aikh-rp-action"
            onClick={() => {
              void actions.openMarkdown(item.filePath);
            }}
          >
            <Icon name="square-arrow-out-up-right" /> Open Markdown
          </button>
          {item.sourceUrl && (
            <button className="aikh-rp-action" onClick={() => actions.openOriginal(item.sourceUrl)}>
              <Icon name="external-link" /> Open Original
            </button>
          )}
        </div>
      </section>

      <div className="aikh-rp-footer">
        <span className="aikh-dot-green" /> All conversations are stored locally in your vault
        <span className="aikh-rp-version">v{plugin.manifest.version}</span>
      </div>

      {showModal && <KnowledgeNoteModal item={item} onClose={() => setShowModal(false)} />}
    </div>
  );
}
