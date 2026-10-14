# Deployment Guide - Production Readiness

## 1. Backend Service
Deploy the FastAPI backend on a cloud instance (AWS EC2, Heroku, or GCP Compute Engine) or using a containerized workflow:
- **Production Server**: Use `gunicorn` with `uvicorn` workers.
  ```bash
  gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
  ```
- **Reverse Proxy**: Place `Nginx` in front of the backend to handle SSL termination and routing.

## 2. Deep Learning Models & Storage
- Place the Keras `.h5`/`.keras` model files in a dedicated storage directory mapped via the `MODEL_DIRECTORY` environment variable.
- For high-volume settings, deploy models via **TensorFlow Serving** or **Triton Inference Server** to process inference calls asynchronously.
- Connect filesystems/storage to an external S3-compatible cloud bucket rather than local disks.

## 3. Database
- Transition `DATABASE_URL` from SQLite (`sqlite:///./vitascan.db`) to a managed PostgreSQL cluster (e.g. AWS RDS or Supabase).
- Run migration scripts in deployment pipelines:
  ```bash
  alembic upgrade head
  ```

## 4. Frontend Service
- Deploy the Next.js bundle on Vercel, Netlify, or AWS Amplify.
- Ensure the production environment variables (`NEXT_PUBLIC_API_URL`) point directly to the backend domain.
