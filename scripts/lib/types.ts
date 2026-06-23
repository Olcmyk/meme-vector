export interface MemeData {
  filename: string;
  content: string;
}

export interface MemeVector {
  id: string;
  values: number[];
  metadata: {
    imageUrl: string;
    description: string;
    source: string;
  };
}

export interface EmbeddingResponse {
  data: Array<{
    embedding: number[];
  }>;
}
