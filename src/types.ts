export interface ReviewItem {
  id: string;
  business_id: string;
  text: string;
  is_used: boolean;
  created_at: string;
}

export interface ReviewStats {
  total: number;
  used: number;
  unused: number;
  percentUsed: number;
}
