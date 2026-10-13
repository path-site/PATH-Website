# Parish of the Alliance of the Two Hearts (PATH) — Official Website & CMS

A complete, modern, responsive, and database-driven web application and Content Management System (CMS) built for the **Parish of the Alliance of the Two Hearts (PATH)**, Archdiocese of Cebu.

---

## 🏛️ System Overview

The system consists of two primary interfaces:

1. **Public Website** (`http://localhost:5173/`):
   - **Hero Slideshow**: High-resolution church photography with configurable overlays, titles, captions, and call-to-actions.
   - **Top Navigation Bar**: Sticky, responsive bar featuring an **About** dropdown menu (hover on desktop, accordion on mobile) with *Mission & Vision*, *History of the Church*, and *Priests*.
   - **Modular Homepage**: Dynamic sections (Welcome message, Latest Announcements, Upcoming Events, Priest Highlight, Photo Gallery Preview, Contact information).
   - **Dedicated Pages**:
     - **Announcements**: Search, category filters, publication timestamps, and individual detail pages (`/announcements/:slug`).
     - **Mission & Vision**: Core values, statements, and community pillars (`/about/mission-vision`).
     - **Church History**: Chronological milestones and historical timeline cards (`/about/history`).
     - **Priests Directory**: Current and former pastors, biographies, service years (`/about/priests`).
     - **Events**: Upcoming and past activities, liturgical celebrations, details (`/events`, `/events/:slug`).
     - **Gallery**: Albums, categories, and lightbox preview (`/gallery`).
     - **Contact Us**: Address, office hours, mass schedules, map, social channels, and interactive contact form (`/contact`).
     - **Custom Pages**: Any custom page created in the CMS dynamically renders at `/pages/:slug`.

2. **Admin CMS Suite** (`http://localhost:5173/admin`):
   - **Dashboard Overview**: Key metrics and quick actions.
   - **Homepage Builder**: Add, edit, reorder (Move Up / Move Down), and toggle visibility for all homepage sections without modifying code or redeploying.
   - **Page Manager**: Create and publish custom pages with customizable slugs and SEO tags.
   - **Navigation Management**: Add, reorder, and configure parent-child navbar dropdown items.
   - **Announcements CMS**: Draft, preview, publish, unpublish, and archive parish updates.
   - **Events CMS**: Manage parish events, schedules, locations, and posters.
   - **Priests CMS**: Manage clergy directory, titles, biographies, and display order.
   - **History Timeline CMS**: Create historical milestones, dates, and archival photos.
   - **Gallery CMS**: Manage albums, cover photos, and album images.
   - **Media Library**: Upload and reuse images across all sections.
   - **Theme & Branding Settings**: Customize site name, tagline, colors (burgundy, gold accents), fonts, and headers.
   - **Contact Settings**: Update office hours, contact numbers, email, mass schedules, and social links.
   - **Admin Users**: Manage authorized administrators with BCrypt password hashing.
   - **General Settings**: System diagnostics, SEO defaults, and session management.

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Java 17, Spring Boot 3.3.4
- **Security**: Spring Security 6 with stateless JWT (`io.jsonwebtoken` JJWT 0.11.5) and BCrypt password encryption
- **Data & ORM**: Spring Data JPA & Hibernate 6
- **Database**:
  - **Local Development**: H2 Relational File Database (`./data/path_parish_db`) — persists across restarts without requiring MySQL/PostgreSQL installation.
  - **Production Ready**: Fully compatible with PostgreSQL or MySQL by setting environment variables in `application.yml`.
- **Media Uploads**: Local multipart upload (`./uploads/`) with pluggable Cloudinary object storage.

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Routing**: React Router v7
- **Icons**: Lucide React + Catholic aesthetic SVGs
- **HTTP Client**: Axios with automatic JWT injection and error interceptors

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- **Java**: OpenJDK 17 or higher
- **Maven**: Apache Maven 3.8+
- **Node.js**: Node 18+ and npm

### 1. Start the Backend Server (Port 8080)
Open a terminal in the project root:
```powershell
cd backend
mvn spring-boot:run
```
The backend initializes the database schema, runs `DataSeeder.java` to populate initial parish content, and starts on `http://localhost:8080`.

### 2. Start the Frontend Development Server (Port 5173)
Open another terminal:
```powershell
cd frontend
npm install
npm run dev
```
The Vite dev server will start on `http://localhost:5173` with proxy forwarding `/api` requests to `http://localhost:8080`.

---

## 🔐 Default Administrator Credentials

For immediate administrative access:
- **URL**: `http://localhost:5173/admin/login`
- **Email**: `admin@path.org`
- **Password**: `admin123`

*(You can create additional administrators or change your password under `/admin/users`)*

---

## 🌐 Deployment Guides

### 🚂 Backend Deployment (Railway)
1. In [Railway](https://railway.app/), create a **New Project** and choose **Deploy from GitHub repo**.
2. Select `PATH-Website`.
3. In **Settings**:
   - **Root Directory**: `backend` (or leave default root, as `railway.json` at root also points to `backend/Dockerfile`).
4. Add a **Database Service**:
   - Click `+ New` -> **Database** -> **Add PostgreSQL** (or MySQL).
   - Railway will automatically provision the database and set the `DATABASE_URL` environment variable.
5. In your Backend service **Variables**:
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}` (automatically connected by Railway).
   - `JWT_SECRET`: Generate a secure random 256-bit string or use the default.
   - `PORT`: `8080` (Railway automatically sets `PORT`).
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: (Optional for cloud media uploads).
6. Click **Generate Domain** under **Networking** to get your public API URL (e.g. `https://your-backend.up.railway.app`).

---

### ▲ Frontend Deployment (Vercel)
1. In [Vercel](https://vercel.com/), click **Add New...** -> **Project** and import `PATH-Website`.
2. Configure Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: Your Railway backend domain (e.g. `https://your-backend.up.railway.app/api`).
4. Click **Deploy**. Vercel will build the frontend and serve it globally with single-page routing managed by `vercel.json`.

---

## 🔐 Default Administrator Credentials

For immediate administrative access after first deployment:
- **URL**: `/admin/login`
- **Email**: `admin@path.org`
- **Password**: `admin123`

*(You can change credentials and add more administrators in the Admin CMS under `/admin/users`)*

