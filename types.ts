
export interface SegmentationResult {
  toothId: string;
  condition: 'healthy' | 'warning' | 'critical';
  confidence: number;
  description: string;
}

export interface AnalysisResponse {
  summary: string;
  results: SegmentationResult[];
}
