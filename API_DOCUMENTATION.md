# VitaScan AI - API Reference Documentation

All requests should be sent to the endpoint base prefix: `/api/v1`

---

## 1. Authentication APIs

### Login / Token Generation
- **Method**: `POST`
- **Route**: `/auth/login`
- **Description**: Authenticates users and returns OAuth2 token schema.
- **Request Body (x-www-form-urlencoded)**:
  - `username` (string, email)
  - `password` (string)
- **Response (200 OK)**:
  ```json
  {
    "access_token": "jwt_token_here",
    "token_type": "bearer",
    "refresh_token": "refresh_token_here"
  }
  ```

---

## 2. Medical & AI Upload APIs

### Upload Scan/Report
- **Method**: `POST`
- **Route**: `/medical/upload`
- **Description**: Uploads a medical scan and schedules real-time AI inference.
- **Headers**:
  - `Authorization`: `Bearer <jwt_token>`
- **Request Body (multipart/form-data)**:
  - `file`: (binary file stream)
  - `disease_type`: `"dementia"` | `"breast_cancer"` | `"malaria"` | `"anemia"`
- **Response (200 OK)**:
  ```json
  {
    "upload_id": "uuid-string",
    "prediction_id": "uuid-string",
    "file_url": "storage/uploads/dementia/file.jpg",
    "status": "COMPLETED",
    "prediction_result": {
      "result_class": "Benign",
      "confidence_score": 0.98,
      "probability_array": [0.98, 0.02],
      "model_version": "v1.0.0",
      "processing_time_ms": 12.4
    }
  }
  ```
- **Possible Errors**:
  - `400 Bad Request`: Unsupported file type or file size exceeded (Max 50MB).
  - `401 Unauthorized`: Token invalid or expired.
  - `404 Not Found`: Patient profile or category does not exist.

---

## 3. General Data Access

### Get Disease Categories
- **Method**: `POST` / `GET`
- **Route**: `/medical/disease-categories`
- **Headers**:
  - `Authorization`: `Bearer <jwt_token>`
- **Query Parameters**:
  - `search` (string, filter by name)
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "uuid-string",
      "name": "Dementia",
      "description": "MRI scan analysis"
    }
  ]
  ```
