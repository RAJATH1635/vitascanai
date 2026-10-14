# VitaScan AI Client Portal

A Next.js portal featuring responsive Doctor and Patient dashboards integrated directly with our medical AI pipelines.

## Getting Started

### 1. Install Node Packages
Ensure you are in the `frontend` folder:
```bash
npm install
```

### 2. Configure Environment
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

## Build for Production
To generate a highly optimized static bundle:
```bash
npm run build
npm start
```
