export interface Problem {
  id: string;
  problem: string;
  field: string;
  keywords: string[];
  created_at?: string;
  extracted_text?: string;
  structured_summary?: string;
}
