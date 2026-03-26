# Task: User Profile Edit Flow

## Status: Complete

- [x] Backend: `updateProfile` implemented in `backend/app/Http/Controllers/Api/AuthController.php`
- [x] Backend: route added in `backend/routes/api.php` (`PUT /api/auth/profile` under `auth:sanctum`)
- [x] Frontend: `profileApi.updateProfile` added in `frontend/src/utils/api.js`
- [x] Frontend: `/profile` route wired in `frontend/src/App.jsx`
- [x] Frontend: profile page implemented in `frontend/src/pages/ProfileEdit.jsx`
- [x] Frontend: navigation includes Profile link in `frontend/src/components/Navbar.jsx`

## Next cleanup ideas (optional)

- [ ] Move hardcoded API URLs to env (e.g. `VITE_API_BASE_URL`) and reuse `frontend/src/utils/api.js` everywhere
- [ ] Continue splitting page-level components into `frontend/src/pages/*` and reusable UI into `frontend/src/components/*`
