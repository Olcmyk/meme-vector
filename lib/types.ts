export interface MemeResult {
  id: string;
  imageUrl: string;
  description: string;
  score: number;
}

export interface SearchResponse {
  success: boolean;
  results: MemeResult[];
  total: number;
  error?: string;
}
