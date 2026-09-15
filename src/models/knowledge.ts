export type KnowledgeType = "insight" | "idea" | "decision" | "resource" | "action";

export const KNOWLEDGE_TYPE = "ai-knowledge";

export interface KnowledgeNoteInput {
  knowledgeType: KnowledgeType;
  title: string;
  project?: string;
  category?: string;
  sourceConversationTitle: string;
  sourceConversationPath: string;
  body?: string;
}

export interface KnowledgeExtraction {
  summary: string;
  insights: string[];
  decisions: string[];
  actions: string[];
}
