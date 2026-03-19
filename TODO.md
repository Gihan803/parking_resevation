# Task: Implement User Profile Edit on Navbar Name Click

## Steps to Complete:

### 1. Backend Updates ✅ [COMPLETE]

- [ ] Add `updateProfile` method to `backend/app/Http/Controllers/Api/AuthController.php`
  - Validate: full_name (req), phone (opt), current_password (opt req if new_password), new_password/confirm_password (min6 match if provided)
  - Update user, hash new pw if provided, return updated user
- [ ] Add route `Route::put('/auth/profile', [AuthController::class, 'updateProfile']);` in protected auth group `backend/routes/api.php`

### 2. Frontend API Update ✅ [PENDING]

- [ ] Add `profileApi = { updateProfile: async (data) => authenticatedFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }) }` to `frontend/src/utils/api.js`

### 3. Frontend Routing ✅ [PENDING]

- [ ] Add `<Route path="/profile" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />` before catch-all in `frontend/src/App.jsx`

### 4. Navbar Update ✅ [PENDING]

- [ ] Add `onClick={() => navigate('/profile')}` to user name button in `frontend/src/components/Navbar.jsx`

### 5. Create Profile Component ✅ [PENDING]

- [ ] Create `frontend/src/components/ProfileEdit.jsx`
  - Load user from localStorage
  - Form: full_name, phone, password section (current_password, new_password, confirm_password)
  - Submit via profileApi.updateProfile
  - Success: update localStorage, show notification, option back to dashboard
  - Use Tailwind styles matching Login/Register

### 6. Testing & Polish

- [ ] Test backend endpoint
- [ ] Test full flow: login → click name → /profile → edit → save → Navbar updates
- [ ] Mark all complete, attempt_completion

Current Progress: Planning complete. Ready for implementation.
