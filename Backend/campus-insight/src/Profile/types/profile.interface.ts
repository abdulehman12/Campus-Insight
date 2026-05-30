import { InsightEntity } from "@app/Insights/entities/insight.entity";

export interface ProfileResponseInterface {
    profile: {
       username: string;
       email: string;
       bio: string;
       image: string;
       role: string;
       unit: string;
       roll_no: number;
       insights: InsightEntity[];
       followersCount: number;
       followingCount: number;
       following: boolean;
    }
}
    