# 🏛️ NextGov — The Professional Network for Governance & Aspirants

NextGov is a premium, highly responsive professional networking platform tailored specifically for government officials, exam aspirants, and verified educational institutes. Built using the **MERN Stack**, it bridges the gap between aspirants and mentors, allowing for seamless communication, official updates, and spam-free professional guidance.

🌐 **Live Application Link:** [https://gov-network.vercel.app/](https://gov-network.vercel.app/)

---

## ✨ Features

### 👤 1. Advanced Persona-Based Registration
Users can join under specific professional roles tailored to their exact workflow:
* **Government Officials:** Verified badges, toggleable mentorship controls, and a dedicated, spam-free priority inbox.
* **Exam Aspirants:** Follow trusted profiles/institutes, request targeted professional guidance, and track preparation updates.
* **Creators / Institutes:** Publish structural syllabus changes, official circulars, job notifications, and curated study resources.

### 👥 2. Interactive Discovery Network
* Dynamic filtering system allowing users to sort network feeds instantly by *Government Officials*, *Aspirants*, or *Institutes*.
* LinkedIn-style horizontal row-card design offering clean metrics visibility, location-tracking tags, and instant follow-actions.

### 🔔 3. Real-Time Consolidated Notification Engine
* A clean, single vertical notification stream mimicking modern production workflows.
* Automatic state tracking for interaction loops: triggers notifications instantly on **Likes**, **Comments**, **New Followers**, and **Mentorship Requests**.
* Full reactive routing: clicking a user's name or a post activity seamlessly redirects the session to the target profile or post viewport.

### 📱 4. Mobile-Responsive Architecture
* Fully optimized fluid layouts featuring customized dynamic state bars (`LeftSidebar` for desktop and a responsive `BottomNav` bar for mobile devices).

---

## 🛠️ Tech Stack

NextGov leverages a modern, decoupled production architecture:

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | ReactJS, Tailwind CSS, React Router v6, React Hot Toast |
| **Backend** | NodeJS, ExpressJS, JSON Web Tokens (JWT) for session management |
| **Database** | MongoDB Atlas, Mongoose (ODM framework) |
| **Deployment** | Vercel (Frontend Hosting), Render (Backend Service Architecture) |

---

## 📂 Architecture Overview

```text
├── backend/
│   ├── config/            # DB configuration threads
│   ├── controllers/       # Business logic (Auth, Posts, Notifications)
│   ├── middleware/        # JWT Authentication protectors
│   ├── models/            # Database strict schemas (User, Post, Notification)
│   └── routes/            # Express API endpoint mappings
└── frontend/
    ├── src/
    │   ├── components/    # Modular UI Elements (Feed, LeftSidebar, BottomNav)
    │   └── App.jsx        # Route handling & global layouts
```


## ⚙️ Local Development Setup

To replicate and run this platform locally on your machine, follow these steps:

### Prerequisite Setup
Ensure you have **NodeJS** and a **MongoDB Atlas cluster** reference ready.

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/gov-network.git](https://github.com/your-username/gov-network.git)
cd gov-network
```

###2. Backend Environment Setup
Navigate to the backend folder, install dependencies, and create a .env file:
```bash
cd backend
npm install
```

Add the following environment keys inside your .env file:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_encryption_key

Start the local backend server engine:

```Bash
npm start
```

###3. Frontend Environment Setup
Open a separate terminal window, navigate to the frontend directory, install client dependencies, and start the development server:

```Bash
cd frontend
npm install
npm run dev
```

###📝 Code of Conduct & Standards
* NextGov strictly enforces production-ready clean code metrics and architectural standards:
* Zero Hardcoding: All profile components, headers, and navigation layers dynamically interface with real database endpoints (e.g., /api/auth/me, /api/network/discover) to support multiple multi-tenant account sessions seamlessly.
* Strict API Validations: Prevents self-following states, double guidance requests, and checks model structures at the database controller level to stop duplicate/corrupt database entries.
* Atomic Refactoring: Decoupled business controllers and distinct modular routing structures ensure that isolated features can be scaled, tested, or modified without breaking the main application thread.
