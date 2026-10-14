# Project Directory Tree & Structural Documentation

Below is the repository structure for VitaScan AI:

```text
vitascan/
├── backend/
│   ├── alembic/                 # Database migrations (table history)
│   ├── app/
│   │   ├── api/                 # Endpoints (auth, medical, uploads)
│   │   ├── core/                # DB connection, security & config settings
│   │   ├── crud/                # Repository layer (CRUD actions)
│   │   ├── models/              # SQLAlchemy models representing DB tables
│   │   ├── schemas/             # Pydantic data schemas
│   │   ├── services/            # Core business logic handlers
│   │   └── ai/
│   │       ├── preprocessing/   # Image & data preprocessing functions
│   │       ├── models/          # Deep learning models wrapper
│   │       └── router.py        # Intelligent router
│   ├── models/                  # Physical deep learning model binaries (.h5/.keras)
│   ├── storage/                 # Uploaded files and reports filesystem
│   └── seed.py                  # Demo patient and doctor database seeder
└── frontend/
    ├── src/
    │   ├── app/                 # Next.js Pages (dashboard, login, history)
    │   ├── components/          # Shared components (Sidebar, Navbar)
    │   └── lib/                 # Shared Axios API hooks
```
