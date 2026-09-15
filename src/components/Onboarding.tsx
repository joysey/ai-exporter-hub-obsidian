import { useMemo, useState } from "react";
import { usePlugin, useIndexVersion } from "./PluginContext";
import { computeCounts } from "../services/ConversationRepository";

interface Props {
  onDone: () => void;
}

export function Onboarding({ onDone }: Props) {
  const plugin = usePlugin();
  const indexVersion = useIndexVersion();
  const [folder, setFolder] = useState(plugin.settings.rootFolder);

  const items = useMemo(
    () => plugin.indexer.getAll(),
    [indexVersion]
  );
  const counts = useMemo(() => computeCounts(items), [items]);
  const platformCount = Object.keys(counts.platforms).length;

  async function applyFolder() {
    plugin.settings.rootFolder = folder.trim() || "AI Knowledge";
    await plugin.saveSettings();
    await plugin.indexer.build();
    plugin.search.buildMetadataIndex();
  }

  const found = counts.total > 0;

  return (
    <div className="aikh-onboarding">
      <div className="aikh-onboarding-card">
        <h1>Welcome to AI Exporter Hub</h1>
        <p>Turn exported AI conversations into a local knowledge system.</p>

        <label className="aikh-field">
          <span>AI Conversation Folder</span>
          <input value={folder} onChange={(e) => setFolder(e.target.value)} />
        </label>
        <button
          onClick={() => {
            void applyFolder();
          }}
        >
          Scan folder
        </button>

        {found ? (
          <div className="aikh-onboarding-result">
            <div className="aikh-onboarding-big">{counts.total.toLocaleString()}</div>
            <div>conversations detected across {platformCount} platform{platformCount === 1 ? "" : "s"}</div>
          </div>
        ) : (
          <div className="aikh-onboarding-result">
            <p>No AI conversations found yet.</p>
            <p className="aikh-muted">
              Add compatible conversation Markdown files, or select another folder.
            </p>
          </div>
        )}

        <button className="mod-cta aikh-onboarding-cta" onClick={onDone}>
          Open Dashboard
        </button>
      </div>
    </div>
  );
}
