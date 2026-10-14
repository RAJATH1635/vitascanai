# VitaScan AI

Intelligent System for Early Detection of Multiple Diseases. This system utilizes deep learning models to predict Dementia (MRI), Breast Cancer (Histopathology), Malaria (Blood Smear), and Anemia (Clinical CSV data).

## Project Setup Map

### Backend (FastAPI)
Setup details in [backend/README.md](./backend/README.md)
- REST APIs
- Model inference routing
- SQLite DB management

### Frontend (Next.js)
Setup details in [frontend/README.md](./frontend/README.md)
- Patient & Doctor Dashboard
- Secure login portal

### System Architecture
The application runs on a clean, decoupled layout. Uploads flow from Next.js, get validated, written safely to disk, processed into multidimensional tensors, and routed to the correct deep learning service before predictions log in the database.

## Prerequisites
- Node.js 18+
- Python 3.10+
- SQLite3
