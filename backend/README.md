# VitaScan AI Backend Services

This is the FastAPI backend service providing RESTful APIs, authentication, and AI routing pipeline for the VitaScan AI platform.

## Prerequisites
- Python 3.10 to 3.13 (Python 3.14 on Windows will use the mocked fallback mode for Keras models if TensorFlow wheels are not compiled yet)

## Local Setup

### 1. Setup Virtual Environment
```bash
python -m venv venv
```
Activate the environment:
- **Windows (PowerShell)**: `.\venv\Scripts\Activate.ps1`
- **Windows (CMD)**: `.\venv\Scripts\activate.bat`
- **Mac/Linux**: `source venv/bin/activate`

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Database Migrations
Create your local database file and tables:
```bash
alembic upgrade head
```

### 4. Seed Database
Inject mock Admin, Doctor, and Patient users, alongside diagnostic templates:
```bash
python seed.py
```

### 5. Running the API Server
```bash
uvicorn app.main:app --reload
```
The server will start at `http://127.0.0.1:8000`. API Swagger Docs can be found at `http://127.0.0.1:8000/docs`.

## TensorFlow Model Placement
Place your compiled Keras models in the `models/` directory using these filenames:
- `models/dementia_v1.h5`
- `models/breast_cancer_v2.keras`
- `models/malaria_v1.h5`
- `models/anemia_v1.h5`

## Running Automated Tests
```bash
python test_phase3.py
python test_phase5.py
python test_phase6.py
```
