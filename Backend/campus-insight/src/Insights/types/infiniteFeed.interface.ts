
import { InsightEntity } from "@app/Insights/entities/insight.entity";
export interface EndlessFeedResponse {
  data: InsightEntity[];
  meta: {
    fetchedCount: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
}