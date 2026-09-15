import { useState } from "react";
import { Notice } from "obsidian";
import { ConversationIndexItem } from "../models/conversation";
import { KnowledgeType } from "../models/knowledge";
import { usePlugin } from "./PluginContext";

interface Props {
  item: ConversationIndexItem;
  onClose: () => void;
}

const TYPES: KnowledgeType[] = ["insight", "idea", "decision", "resource", "action"];

export function KnowledgeNoteModal({ item, onClose }: Props) {
  const plugin = usePlugin();
  const [type, setType] = useState<KnowledgeType>("insight");
  const [title, setTitle] = useState("");
  const [project, setProject] = useState(item.project ?? "");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!title.trim()) {
      new Notice("AI Exporter Hub: Please enter a title.");
      return;
    }
    setSaving(true);
    try {
      const file = await plugin.knowledgeNotes.create({
        knowledgeType: type,
        title: title.trim(),
        project: project.trim() || undefined,
        category: item.category,
        sourceConversationTitle: item.title,
        sourceConversationPath: item.filePath,
        body: body.trim() || undefined,
      });
      new Notice("AI Exporter Hub: Knowledge note created.");
      onClose();
      await plugin.app.workspace.getLeaf("tab").openFile(file);
    } catch (e) {
      console.error(e);
      new Notice("AI Exporter Hub: Could not create knowledge note.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="aikh-modal-overlay" onClick={onClose}>
      <div className="aikh-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Save as Knowledge Note</h3>

        <label className="aikh-field">
          <span>Type</span>
          <select value={type} onChange={(e) => setType(e.target.value as KnowledgeType)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </label>

        <label className="aikh-field">
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </label>

        <label className="aikh-field">
          <span>Project</span>
          <input value={project} onChange={(e) => setProject(e.target.value)} placeholder="Optional" />
        </label>

        <label className="aikh-field">
          <span>Note</span>
          <textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your insight…" />
        </label>

        <div className="aikh-field aikh-source-hint">
          Source: <strong>{item.title}</strong>
        </div>

        <div className="aikh-modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button
            className="mod-cta"
            disabled={saving}
            onClick={() => {
              void create();
            }}
          >
            {saving ? "Creating…" : "Create Note"}
          </button>
        </div>
      </div>
    </div>
  );
}
