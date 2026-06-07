# CampusInsight

CampusInsight is a secure, private social media platform designed exclusively for educational institutions. It bridges the communication gap by enabling students, teachers, and administrators to interact, collaborate, and share insights seamlessly within a trusted, verified ecosystem. 

To maintain an academic and safe digital environment, the platform features a custom-built automated content moderation pipeline that evaluates user-generated posts in real time, ensuring all media and text align with moral and community guidelines.

---

## 🛠️ Tech Stack & Architecture

### Frontend
* **Framework:** React.js (Component-driven UI development)
* **Styling:** Tailwind CSS (Utility-first framework for responsive, modern design)

### Backend Core
* **Framework:** NestJS (TypeScript-based enterprise modular architecture)
* **Database:** PostgreSQL
* **ORM:** TypeORM

### AI & Media Processing (Content Moderation Pipeline)
* **Hugging Face:** Utilized for advanced AI models to analyze and classify text, images, and video content for moral standards and guidelines.
* **Obscenity:** Integrated for fast, lightweight text-based profanity and bad language filtering.
* **FFmpeg & FFprobe (`ffmpeg-static`, `ffprobe-static`):** Used for multimedia binary processing, enabling the backend to inspect, analyze, and extract frames from uploaded videos for moderation before they are published.

---

## 🚀 Key Features

* **Social Connectivity:** Users can interact with the campus community through creating insights (posts), liking, commenting, and reposting.
* **Role-Based Interaction:** Dynamic controls tailored for Students, Teachers, and Administrators.
* **Targeted Communication:** An official announcement system for administrative and faculty alerts.
* **Privacy & Collaboration:** Supports following metrics, user interactions, and a roadmap for private messaging/department groups.
* **Smart Moderation:** Real-time analysis of multimedia uploads to intercept explicit, harmful, or immoral material immediately.

---

## 📊 Database Architecture

The platform uses a relational schema managed via **TypeORM** to map out complex institutional social graphs efficiently.

* **UserEntity:** Manages accounts, credentials, and institutional access roles.
* **InsightEntity:** Represents the primary content posts (Insights) shared within the campus network.
* **FollowEntity:** Tracks user-to-user relationships (the campus network graph).
* **LikeEntity:** Tracks user engagements and reactions to specific insights.
* **CommentEntity:** Manages threaded discussions and feedback on insights.
* **RepostEntity:** Handles sharing mechanics, allowing users to amplify existing insights.
* **ReportEntity:** Tracks community-flagged items and logs structural metadata for the automated moderation workflow.

---

## 📦 Project Layout

```text
├── Backend/
│   └── campus-insight/
│       ├── src/               # NestJS Core Application
│       ├── Dockerfile.dev     # Development Docker configuration
│       └── docker-compose.yml # Service orchestration
└── Frontend/                  # React Application

## 🔐 Environment Configuration

Create a `.env` file in `Backend/campus-insight/` and use the following template:

```env
# Application
PORT=3000
JWT_SECRET=your_super_secret_random_string_here
JWT_EXPIRATION=1d

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_db_password
DB_NAME=campus_insight

# AI / Content Moderation
# Get your key at: [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Initial Admin Credentials
ADMIN_EMAIL=admin@campusinsight.com
ADMIN_PASSWORD=your_admin_password


⚙️ Getting Started & Local Setup
The backend environment is fully containerized using Docker to ensure smooth cross-platform service coordination.

📋 Prerequisites
Docker Desktop installed and running.

Node.js installed locally for running the frontend.

🛠️ Backend Environment Setup
Navigate to the backend project root:

Bash
   cd Backend/campus-insight
Configure your environment variables: Ensure your .env file is set up using the template provided in the configuration section above.

Spin up the backend services:
Run the following command to build and launch the PostgreSQL container, pgAdmin dashboard, and NestJS application service simultaneously:

Bash
   docker compose up --build
Available Service Endpoints:

Backend API server: http://localhost:3000

pgAdmin Web Interface: http://localhost:5050

PostgreSQL Direct Port: 5432

💻 Frontend Setup
Open a new terminal instance and navigate to the React app folder:

Bash
   cd Frontend/@latest
Install the necessary development dependencies:

Bash
   npm install
Boot up the Vite development server:

Bash
   npm run dev
The user interface will be spun up locally (typically running at http://localhost:5173 or your specified Vite application port).
