# CampusInsight

CampusInsight is a secure, private social media platform designed exclusively for educational institutions. It bridges the communication gap by enabling students, teachers, and administrators to interact, collaborate, and share insights seamlessly within a trusted environment. 

To maintain an academic and safe digital ecosystem, the platform features an automated content moderation pipeline that evaluates user-generated posts in real time, ensuring all content aligns with community standards.


Social Connectivity: Users can interact with the community through posting, liking, and sharing content.

Targeted Communication: Includes a specialized announcement system for official updates from faculty or administration.

Privacy & Collaboration: Supports private groups for department-specific or project-based collaboration (currently in development/planning).

Smart Moderation: Integrated AI layer to monitor text and media, ensuring all interactions remain professional and appropriate for an academic setting.

## 🛠️ Tech Stack & Architecture

### Frontend
* **Framework:** React.js (Component-driven UI development)
* **Styling:** Tailwind CSS (Utility-first framework for responsive, modern design)

### Backend Core
* **Framework:** NestJS (TypeScript)
* **Database:** PostgreSQL
* **ORM:** TypeORM

### AI & Media Processing (Content Moderation Pipeline)
* **Hugging Face:** Utilized for AI models to analyze and classify text, images, and video content for moral and community guidelines.
* **Obscenity:** Integrated for fast, lightweight text-based profanity and bad language filtering.
* **FFmpeg & FFprobe (`ffmpeg-static`, `ffprobe-static`):** Used for multimedia processing, enabling the backend to inspect, analyze, and extract frames from uploaded videos for moderation before they are published.

* ## 📊 Database Architecture

The platform uses **PostgreSQL** managed via **TypeORM** with a relational schema designed to support social networking and moderation workflows efficiently.

### Core Entities:
* **UserEntity:** Manages accounts and access controls for different institutional roles (Students, Teachers, Admins).
* **InsightEntity:** Represents the primary content posts shared by users on the platform.
* **FollowEntity:** Handles the social graph, tracking follower/following relationships between users.
* **LikeEntity:** Tracks user engagements and reactions to specific insights.
* **CommentEntity:** Manages threaded discussions and replies on insights.
* **RepostEntity:** Handles sharing mechanics, allowing users to amplify existing insights.
* **ReportEntity:** Tracks community-flagged items and hooks directly into the automated moderation pipeline for audit logs.
