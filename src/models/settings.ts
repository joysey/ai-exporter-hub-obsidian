export interface AIExporterHubSettings {
  schemaVersion: number;

  rootFolder: string;

  defaultView: "home" | "inbox" | "recent";
  showDashboardOnStartup: boolean;

  categories: string[];

  includeBodySearch: boolean;
  searchDebounceMs: number;
  maxIndexedFiles: number;

  knowledgeFolder: string;

  showRightPanel: boolean;

  /** "auto" follows Obsidian/system; "dark"/"light" force a palette. */
  themeMode: "auto" | "dark" | "light";

  onboardingComplete: boolean;
}

export const DEFAULT_SETTINGS: AIExporterHubSettings = {
  schemaVersion: 1,
  rootFolder: "AI Knowledge",
  defaultView: "home",
  showDashboardOnStartup: false,
  categories: ["Ideas", "Research", "Writing", "Coding", "Business", "Resources"],
  includeBodySearch: true,
  searchDebounceMs: 250,
  maxIndexedFiles: 20000,
  knowledgeFolder: "AI Knowledge/Knowledge",
  showRightPanel: true,
  themeMode: "auto",
  onboardingComplete: false,
};
