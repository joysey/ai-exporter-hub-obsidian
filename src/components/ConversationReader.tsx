import { MarkdownRenderer, Notice, TFile } from "obsidian";
import { useEffect, useRef, useState } from "react";
import { ConversationIndexItem } from "../models/conversation";
import { usePlugin, useHubView } from "./PluginContext";
import { formatDate } from "../utils/dates";
import { parseConversation, ChatSegment } from "../utils/conversation-parse";
import { PlatformBadge } from "./Badge";
import { platformStyle } from "../utils/platforms";
import { Icon } from "./Icon";

interface Props {
  item: ConversationIndexItem;
}

const MAX_RENDER_BYTES = 5 * 1024 * 1024;

/** Renders a single chat turn's markdown into a bubble. */
function Bubble({
  segment,
  item,
}: {
  segment: ChatSegment;
  item: ConversationIndexItem;
}) {
  const plugin = usePlugin();
  const view = useHubView();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.empty();
    void MarkdownRenderer.render(plugin.app, segment.content, el, item.filePath, view);
  }, [segment.content]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(segment.content.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      new Notice("Copy failed. You can still select the text manually.");
    }
  };

  const isUser = segment.role === "user";
  return (
    <div className={`aikh-turn ${isUser ? "is-user" : "is-assistant"}`}>
      <div className="aikh-turn-avatar">
        {isUser ? (
          <span className="aikh-user-avatar">Y</span>
        ) : (
          <PlatformBadge platform={item.platform} size={30} />
        )}
      </div>
      <div className="aikh-turn-main">
        <div className="aikh-turn-head">
          <span className="aikh-turn-role">
            {isUser ? "You" : item.platform === "Other" ? "Assistant" : item.platform}
          </span>
          {segment.time && <span className="aikh-turn-time">{segment.time}</span>}
          <button
            className={`aikh-turn-copy ${copied ? "is-copied" : ""}`}
            onClick={() => {
              void onCopy();
            }}
            aria-label="Copy message"
            title="Copy message"
          >
            <Icon name={copied ? "check" : "copy"} />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="aikh-turn-bubble markdown-rendered" ref={bodyRef} />
      </div>
    </div>
  );
}

export function ConversationReader({ item }: Props) {
  const plugin = usePlugin();
  const [segments, setSegments] = useState<ChatSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tooLarge, setTooLarge] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setTooLarge(false);
    setSegments([]);

    const file = plugin.app.vault.getAbstractFileByPath(item.filePath);
    if (!(file instanceof TFile)) {
      setError("File not found. It may have been moved or deleted.");
      return;
    }

    void (async () => {
      try {
        const raw = await plugin.app.vault.cachedRead(file);
        if (cancelled) return;
        if (raw.length > MAX_RENDER_BYTES) setTooLarge(true);
        setSegments(parseConversation(raw));
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setError("Could not render this conversation.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [item.filePath]);

  const ps = platformStyle(item.platform);

  return (
    <div className="aikh-reader">
      <div className="aikh-reader-head">
        <h1 className="aikh-reader-title">{item.title}</h1>
        <div className="aikh-reader-pills">
          <span className="aikh-pill" style={{ color: ps.color, borderColor: ps.color }}>
            <PlatformBadge platform={item.platform} size={16} /> {item.platform}
          </span>
          {item.project && (
            <span className="aikh-pill aikh-pill-accent">
              <Icon name="layers" className="aikh-pill-icon" /> Project: {item.project}
            </span>
          )}
          {item.category && (
            <span className="aikh-pill aikh-pill-accent">
              <Icon name="tag" className="aikh-pill-icon" /> Category: {item.category}
            </span>
          )}
          {!!item.messageCount && item.messageCount > 0 && (
            <span className="aikh-reader-meta">
              <Icon name="message-square" className="aikh-meta-icon" /> {item.messageCount} messages
            </span>
          )}
          <span className="aikh-reader-meta">
            <Icon name="clock" className="aikh-meta-icon" /> Updated {formatDate(item.exportedAt ?? item.updatedAt ?? item.createdAt)}
          </span>
        </div>
      </div>

      {error && <div className="aikh-reader-error">{error}</div>}
      {tooLarge && (
        <div className="aikh-reader-warning">
          Very large conversation ({(item.wordCount ?? 0).toLocaleString()} words). Rendering may be slow.
        </div>
      )}

      <div className="aikh-reader-body">
        {segments.map((seg, i) => (
          <Bubble key={i} segment={seg} item={item} />
        ))}
      </div>
    </div>
  );
}
