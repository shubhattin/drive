# Drive - Simple file storage application

A modern, full-stack file storage application built with Next.js that provides secure file and folder management with AWS S3 integration.

## ✨ Features

### File Management

- **File Upload** - Upload files up to 500MB with presigned S3 URLs
- **File Download** - Secure download with presigned URLs and proper content disposition
- **File Operations**
  - Rename files
  - Move files between folders
  - Copy files to different locations
  - Delete files
- **File Listing** - Browse files and folders with metadata (size, type, dates)

### Folder Management

- **Folder Operations**
  - Create new folders
  - Rename folders
  - Move folders between locations
  - Copy folders with all contents (deep copy)
  - Delete folders and all contents recursively
- **Hierarchical Structure** - Full nested folder support
- **Folder Navigation** - Browse through folder hierarchy

### Security & Access Control

- **User Authentication** - Secure user authentication system
- **Access Control** - Users can only access their own files and folders
- **Presigned URLs** - Secure, time-limited access to S3 resources
- **Input Validation** - Comprehensive validation using Zod schemas

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality, accessible UI components
- **tRPC** - End-to-end typesafe APIs

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **tRPC** - Type-safe API layer
- **Drizzle ORM** - TypeScript SQL ORM

### Database & Storage

- **PostgreSQL (Neon)** - Serverless PostgreSQL database
- **Redis (Upstash)** - Serverless Redis for caching
- **AWS S3** - Object storage for files

### Authentication

- **Custom Auth System** - Built-in authentication with session management

## Previous Version

Untill [this commit](https://github.com/shubhattin/drive/tree/f945f5112d842b48ba9b69a7e1a1bb2a054aafef)

- **[SvelteKit](https://kit.svelte.dev/)** - Sveltekit as Backend as well as Frontend using ([Svelte](https://svelte.dev/), [TypeScript](https://www.typescriptlang.org/))
- **[tRPC](https://trpc.io/)** - Typesafe API for auth and Drive API
- **_[Deta](https://deta.space/developers)_** - A Free Hosting service to host and deploy our app. Also provides inbuilt support for databases and File Storage. This service is **no longer operational**.

This Repository was using **[FastAPI](https://fastapi.tiangolo.com/)** as Backend and _[GraphQL](https://strawberry.rocks/)_ for Drive API, till [this commit](https://github.com/shubhattin/drive/tree/a4a41919d92f0d614d4773efa6551f8653373714).
<br/>
I had also _built_ the same site using **Nextjs** and **React** for frontend, [here](https://github.com/shubhattin/drive-react).
