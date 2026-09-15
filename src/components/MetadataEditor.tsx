import { useEffect, useState } from "react";
import { ConversationIndexItem, ConversationStatus } from "../models/conversation";
import { usePlugin } from "./PluginContext";
import { useActions } from "./actions";

interface Props {
  item: ConversationIndexItem;
  projects: string[];
}

export function MetadataEditor({ item, projects }: Props) {
  const plugin = usePlugin();
  const actions = useActions();
  const [tagsInput, setTagsInput] = useState(item.tags.join(", "));

  useEffect(() => {
    setTagsInput(item.tags.join(", "));
  }, [item.filePath, item.tags.join(",")]);

  const categories = ["", ...plugin.settings.categories];

  return (
    <div className="aikh-meta-editor">
      <label className="aikh-field">
        <span>Project</span>
        <input
          list="aikh-projects"
          value={item.project ?? ""}
          placeholder="None"
          onChange={(e) => {
            void actions.setProject(item.filePath, e.target.value.trim() || null);
          }}
        />
        <datalist id="aikh-projects">
          {projects.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </label>

      <label className="aikh-field">
        <span>Category</span>
        <select
          value={item.category ?? ""}
          onChange={(e) => {
            void actions.setCategory(item.filePath, e.target.value || null);
          }}
        >
          {categories.map((c) => (
            <option key={c || "none"} value={c}>{c || "None"}</option>
          ))}
        </select>
      </label>

      <label className="aikh-field">
        <span>Status</span>
        <select
          value={item.status}
          onChange={(e) => {
            void actions.setStatus(item.filePath, e.target.value as ConversationStatus);
          }}
        >
          <option value="inbox">Inbox</option>
          <option value="reviewed">Reviewed</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <label className="aikh-field">
        <span>Tags</span>
        <input
          value={tagsInput}
          placeholder="comma, separated"
          onChange={(e) => setTagsInput(e.target.value)}
          onBlur={() => {
            void actions.setTags(
              item.filePath,
              tagsInput
                .split(",")
                .map((t) => t.trim().replace(/^#/, ""))
                .filter(Boolean)
            );
          }}
        />
      </label>

      <label className="aikh-check aikh-field-inline">
        <input
          type="checkbox"
          checked={item.favorite}
          onChange={(e) => {
            void actions.setFavorite(item.filePath, e.target.checked);
          }}
        />
        Favorite
      </label>
    </div>
  );
}
