# Silver Lab Verification System

A Next.js application for verifying silver bars using serial numbers. This project replicates the functionality of the original HTML page, converted to a modern React-based web application.

## Features

- Serial number verification for silver bars
- Interactive modal with verification details
- Certificate download functionality
- Responsive design with Tailwind CSS
- TypeScript support

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment

Copy `.env.local` and set your MongoDB connection string to `MONGODB_URI`.

Example `.env.local` (already added with a placeholder):

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/mydatabase?retryWrites=true&w=majority
```

## Admin Panel

Visit `/admin` to access the admin panel. Login with the hardcoded credentials:

- username: `admin`
- password: `admin`

From the admin panel you can add or update entries. Entries are stored in MongoDB and will be visible to the main search.

## Sample Serial Numbers

Try these sample serial numbers for testing:
- KHI0B7C6Y
- LHR1A2B3C
- ISB2D4E6F
- KHI3F5G7H

## Build

To build the project for production:

```bash
npm run build
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
