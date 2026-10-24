# Donate 

**Community Giving Platform for Algeria**

_Donate items · Request help · Volunteer · Connect_

[![Next.js](https://img.shields.io/badge/Next.js_15-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Appwrite](https://img.shields.io/badge/Appwrite-FD366E?logo=appwrite&logoColor=white)](https://appwrite.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Overview

**Donate** is a full-stack community platform that connects Algerians who want to donate with those who need help. Post items you no longer need, request support, or sign up as a volunteer — all in one place.

---

## Features

| Feature | Description |
|---|---|
|  **Donate Items** | List items you want to give away with photos and location |
|  **Request Help** | Post what you need and get connected to donors |
|  **Volunteer** | Sign up to help distribute or deliver items |
|  **Messaging** | In-app messaging between donors and recipients |
|  **Map View** | Browse posts by location with Leaflet.js |
|  **Auth** | Email/password + Google OAuth via Better Auth |
| **Dark Mode** | Full light/dark theme support |
| **Responsive** | Mobile-first, works on any device |
| **NSFW Filter** | AI-powered image moderation with NSFWJS |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Animations** | Framer Motion |
| **Backend / DB** | Appwrite Cloud + MongoDB / Mongoose |
| **Auth** | Better Auth + Google OAuth |
| **Storage** | Cloudinary |
| **Maps** | Leaflet + React-Leaflet |
| **Background Jobs** | Inngest |
| **Email** | Nodemailer |
| **AI Moderation** | TensorFlow.js + NSFWJS |
| **Forms** | React Hook Form + Zod |

---

## 🏁 Getting Started

### Prerequisites

- Node.js `>=18`
- An [Appwrite Cloud](https://cloud.appwrite.io) project
- A [Google Cloud](https://console.cloud.google.com) OAuth 2.0 client (for Google sign-in)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/Donate.git
cd Donate
npm install
```

### 2. Configure Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

See [`.env.local.example`](.env.local.example) for all required variables and descriptions.

### 3. Set Up Appwrite

1. Create a project on [Appwrite Cloud](https://cloud.appwrite.io).
2. Create a **Database** and note its ID.
3. Create three **Collections**: `posts`, `users`, `messages`.
4. Create a **Storage Bucket** for media uploads.
5. Set permissions:
   - `posts` / `messages`: Any (read), Authenticated users (write)
   - `users`: Authenticated users (read/write)
6. Paste all IDs into your `.env.local`.

### 4. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
Donate/
├── app/
│   ├── (main)/         # Main app routes (home, profile, explore…)
│   ├── (editor)/       # Post creation / editing flows
│   ├── admin/          # Admin dashboard
│   ├── auth/           # Login / register pages
│   └── stories/        # Stories feature
├── components/         # Shared UI components
├── lib/                # Server actions, DB clients, helpers
├── types/              # Global TypeScript types
└── public/             # Static assets
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Appwrite API endpoint (default: `https://cloud.appwrite.io/v1`) |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Your Appwrite project ID |
| `NEXT_PUBLIC_APPWRITE_DATABASE_ID` | Your Appwrite database ID |
| `NEXT_PUBLIC_APPWRITE_COLLECTION_POSTS_ID` | Posts collection ID |
| `NEXT_PUBLIC_APPWRITE_COLLECTION_USERS_ID` | Users collection ID |
| `NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES_ID` | Messages collection ID |
| `NEXT_PUBLIC_APPWRITE_BUCKET_ID` | Storage bucket ID |
| `CLIENT_ID` | Google OAuth client ID |
| `CLIENT_SECRET` | Google OAuth client secret |

> **Never commit `.env.local`** — it is already added to `.gitignore`.

---

## 📜 Scripts

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check formatting without writing
```

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with for the Algerian community
</div>
