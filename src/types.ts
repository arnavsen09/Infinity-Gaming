export interface ReviewItem {
  id: string;
  text: string;
  is_used: boolean;
  used_at?: string | null;
  created_at: string;
}

export interface ReviewStats {
  total: number;
  used: number;
  unused: number;
  percentUsed: number;
}
