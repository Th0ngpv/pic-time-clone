# Pic Time Clone - Private Photo Album

A minimal Next.js application for photographers to share private albums with Google Drive integration. Built with TypeScript, Tailwind CSS, and Google Drive API.

## Features

- 📸 **Photo Gallery**: Display images from Google Drive in a responsive grid
- ✅ **Batch Selection**: Select multiple images with checkboxes
- 📦 **ZIP Downloads**: Download selected images as a ZIP file
- 🔽 **Individual Downloads**: Download single images directly
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 🔐 **Private Access**: Secure Google Drive service account authentication

## Setup

1. **Google Drive Service Account**:
   - Create a Google Cloud project
   - Enable the Google Drive API
   - Create a service account and download the JSON key
   - Share your Google Drive folder with the service account email

2. **Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Google Drive credentials:
   ```
   GOOGLE_DRIVE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
   GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## API Routes

- `GET /api/files` - Fetch all images from Google Drive folder
- `GET /api/download/[fileId]` - Download individual file
- `POST /api/download-zip` - Download selected files as ZIP

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API Integration**: Google Drive API (googleapis)
- **File Compression**: Archiver (for ZIP downloads)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
