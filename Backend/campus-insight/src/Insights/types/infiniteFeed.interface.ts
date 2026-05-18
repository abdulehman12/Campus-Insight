
import { InsightEntity } from "@app/Insights/insight.entity";
export interface EndlessFeedResponse {
  data: InsightEntity[];
  meta: {
    fetchedCount: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
}