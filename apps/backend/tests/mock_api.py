# Mock API Server Backend Implementation

## 1. Persistence Layer
Create `.data/mock_routes.json` for storing mock routes
Add persistence file loading/saving functions and `_ensure_data_directory()` helper function
## 2. Mock Route CRUD Operations
Add endpoints for creating, reading, updating, and deleting mock routes with validation and path normalization
## 3. Mock Request Handling at `/mock/*`
Implement handler that strips query strings, checks for exact path match, and logs request info with header redaction
## 4. Frontend Page for Mock API Server
Create `apps/frontend/src/pages/MockApiServer.tsx` with UI for route management and preview of mock request/response
Implement route management UI (method, path, status/delay/enabled toggles, headers/body editor)
Add cURL generation example with quick cURL example per Feature Specifications

## 5. Update Configuration Files
Update `.gitignore` to include `apps/backend/.data/`
Update `apps/backend/app/main.py` to import mock_api module
Update `apps/backend/tests/test_tools.py` for mock API testing

## 6. Frontend Tests
Create `apps/frontend/src/test/MockApiServer.test.tsx` with tests for CRUD operations and route matching
## 7. Backend Tests
Create `apps/backend/tests/mock_api.py` with pytest tests for mock API CRUD, route matching, and request handling
