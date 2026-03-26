# Task: User Profile Edit Flow

## Status: Complete

- [x] Backend: `updateProfile` implemented in `backend/app/Http/Controllers/Api/AuthController.php`
- [x] Backend: route added in `backend/routes/api.php` (`PUT /api/auth/profile` under `auth:sanctum`)
- [x] Frontend: `profileApi.updateProfile` added in `frontend/src/shared/api/index.js`
- [x] Frontend: `/profile` route wired in `frontend/src/App.jsx`
- [x] Frontend: profile page implemented in `frontend/src/features/profile/pages/ProfileEdit.jsx`
- [x] Frontend: navigation includes Profile link in `frontend/src/shared/components/Navbar.jsx`

## Next cleanup ideas (optional)

- [x] Move hardcoded API URLs to env (e.g. `VITE_API_BASE_URL`) and reuse `frontend/src/shared/api/index.js` everywhere
- [x] Reorganize by domain features under `frontend/src/features/*` and shared code under `frontend/src/shared/*`
