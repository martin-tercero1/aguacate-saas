# Quick Start Testing Guide

## Pre-Deployment Setup

### 1. Database Migrations

Run these SQL scripts in your Supabase SQL editor **in this exact order**:

```bash
# First: Create tables and seed function
scripts/add-categories-and-profile.sql

# Second: Set up RLS policies and trigger
scripts/fix-rls-and-triggers.sql

# Third: Grant permissions
scripts/grant-table-permissions.sql
```

**Verification:**
- [ ] Tables exist: `auth.users`, `profiles`, `categories`
- [ ] Trigger exists: `on_auth_user_created`
- [ ] Function exists: `seed_default_categories()`
- [ ] RLS policies are enabled

### 2. Environment Variables

Ensure these are set in your Vercel project (Settings → Variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## Testing Scenarios

### Scenario 1: Complete Signup Flow

**Test:** Create a new user account with farm information

1. Navigate to `https://your-app.com/auth/signup`

2. **Step 1 - Account Details:**
   - Full Name: "Juan García"
   - Email: "juan.garcia@example.com"
   - Password: "SecurePass123!" (observe strength indicator)
   - Phone: "+34 612 345 678"
   - Click "Next"

   Expected: No validation errors, progress bar updates to step 2

3. **Step 2 - Farm Information:**
   - Farm Name: "Finca Los Aguacates"
   - Location: "Málaga, Andalucía"
   - Hectares: "25.5"
   - Click "Register"

   Expected: Loading spinner, then redirect to signin with success message

4. **Database Verification:**
   - Check `auth.users` table: new user created
   - Check `profiles` table: new profile with farm info
   - Check `categories` table: 11 default categories seeded for user

5. **Expected in profiles table:**
   ```
   id: [user_id]
   fullName: "Juan García"
   phone: "+34 612 345 678"
   farmName: "Finca Los Aguacates"
   location: "Málaga, Andalucía"
   hectares: 25.50
   ```

---

### Scenario 2: Validation Testing

**Test:** Ensure all validations work correctly

1. **Empty Fields (Step 1):**
   - Click "Next" without entering name
   - Expected: Error message "El nombre es requerido"

2. **Email Validation:**
   - Enter "notanemail"
   - Expected: Browser HTML5 validation prevents submission

3. **Password Mismatch:**
   - Password: "SecurePass123!"
   - Confirm: "DifferentPass456!"
   - Expected: Error "Las contraseñas no coinciden"

4. **Short Password:**
   - Password: "Short1!"
   - Expected: Error "La contraseña debe tener al menos 8 caracteres"

5. **Password Strength Indicator:**
   - Type "weak" → Shows "Muy débil" (red, 1/4 bars)
   - Type "Weak123" → Shows "Aceptable" (yellow, 2/4 bars)
   - Type "Weak123!" → Shows "Buena" (blue, 3/4 bars)
   - Type "SecurePass123!" → Shows "Muy fuerte" (green, 4/4 bars)

6. **Missing Farm Fields (Step 2):**
   - Leave Farm Name empty, click "Register"
   - Expected: Error "El nombre de la finca es requerido"

---

### Scenario 3: Signin Flow

**Test:** Login with newly created account

1. Navigate to `https://your-app.com/auth/signin`

2. **Success Path:**
   - Email: "juan.garcia@example.com"
   - Password: "SecurePass123!"
   - Click "Iniciar Sesión"
   - Expected: Spinner animation, then redirect to `/dashboard`

3. **Invalid Credentials:**
   - Email: "juan.garcia@example.com"
   - Password: "WrongPassword"
   - Expected: Error message "Error al iniciar sesión..."

4. **Missing Fields:**
   - Leave email empty, click submit
   - Expected: Error "Por favor ingresa tu email"

5. **Password Visibility Toggle:**
   - Enter password, click eye icon
   - Expected: Password becomes visible as dots change to text
   - Click again: Password hidden

6. **Remember Device:**
   - Check "Remember this device" checkbox
   - Sign in successfully
   - Expected: Return visit should remember user (if supported)

---

### Scenario 4: UI/UX Responsiveness

**Test:** Design works on all screen sizes

**Desktop (1024px+):**
- [ ] Form centered with appropriate spacing
- [ ] Two-column layout if applicable
- [ ] Full card width appears balanced
- [ ] All inputs accessible without scrolling

**Tablet (768px):**
- [ ] Form stack vertically
- [ ] Form readable and usable
- [ ] Buttons full width
- [ ] Touch targets at least 44px

**Mobile (375px):**
- [ ] Form fully responsive
- [ ] No horizontal scroll
- [ ] Buttons touch-friendly (48px+ height)
- [ ] Font sizes readable without zoom
- [ ] Inputs tap-friendly with proper padding

---

### Scenario 5: Error Recovery

**Test:** User can recover from errors

1. **Signup with existing email:**
   - Use email that already exists
   - Expected: Clear error message
   - User can click back, correct email, try again

2. **Network error simulation:**
   - (In DevTools) Throttle connection to "Offline"
   - Attempt signup
   - Expected: Error message about connection
   - Go online, retry should work

3. **Profile creation failure:**
   - Manually delete user profile from database
   - User still able to login
   - Categories still available (seeded by trigger or lazy-seeded on access)

---

### Scenario 6: Cross-browser Compatibility

**Test:** Works consistently across browsers

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Check:**
- [ ] Form renders correctly
- [ ] All inputs functional
- [ ] Buttons respond to clicks
- [ ] Password toggle works
- [ ] Error messages display
- [ ] No console errors

---

### Scenario 7: Accessibility Testing

**Test:** Form is accessible to all users

**Keyboard Navigation:**
- [ ] Tab through form fields in logical order
- [ ] Tab reaches all interactive elements
- [ ] Can submit form with keyboard (Enter key)
- [ ] Focus states clearly visible

**Screen Reader (NVDA, JAWS, VoiceOver):**
- [ ] Form labels announced with inputs
- [ ] Error messages announced
- [ ] Button purposes clear
- [ ] Links to signin/signup announced properly

**Color Contrast:**
- [ ] Text readable (WCAG AA standard)
- [ ] Error messages distinguishable (not just color)
- [ ] Focus indicators visible (not just color)

---

## Performance Testing

### Signup Performance

```javascript
// In browser console
console.time('Signup');
// Complete signup flow
console.timeEnd('Signup');
```

**Targets:**
- [ ] Form loads: < 500ms
- [ ] Validation: < 100ms
- [ ] Step transition: < 200ms
- [ ] API call: < 2s
- [ ] Redirect: < 500ms
- **Total signup time: < 5s**

### Database Performance

```sql
-- Check profile insert performance
EXPLAIN ANALYZE
SELECT * FROM profiles WHERE id = 'user-id-here';

-- Check category seeding
SELECT count(*) FROM categories WHERE "userId" = 'user-id-here';
```

**Targets:**
- [ ] Profile lookup: < 10ms
- [ ] Category seeding: < 500ms
- [ ] All inserts within 1s

---

## Security Testing

### XSS Prevention

- [ ] Type `<script>alert('XSS')</script>` in name field
- Expected: No JavaScript execution, safe string saved

### SQL Injection Prevention

- [ ] Type `'; DROP TABLE profiles; --` in farm name
- Expected: No table deletion, string escaped properly

### CSRF Protection

- [ ] Check that forms require valid session tokens
- [ ] CSRF tokens in forms (if applicable)

### Password Security

- [ ] Passwords never logged in console
- [ ] Check localStorage for stored passwords (should be empty)
- [ ] JWT tokens only in HTTP-only cookies

---

## Debugging Guide

### Common Issues

**Issue: "Failed to close prepared statement"**
- **Cause:** Old `seed_default_categories()` function
- **Fix:** Re-run `add-categories-and-profile.sql`
- **Verify:** Function in Supabase shows new implementation

**Issue: Profile not created after signup**
- **Cause:** Profile creation error not propagated
- **Debug:** Check server logs for warnings
- **Fix:** Manually run profile upsert
- **Fallback:** Trigger will create basic profile

**Issue: Categories not seeded**
- **Cause:** Trigger didn't run or seed function failed
- **Debug:** Check logs for `seed_default_categories` warnings
- **Fix:** Manually call in `getCategories()` will seed on demand
- **Verify:** Categories appear when user first accesses them

**Issue: Signin redirects to signin (infinite loop)**
- **Cause:** Session token not stored/recognized
- **Debug:** Check browser cookies (should have `sb-auth-token`)
- **Fix:** Clear cookies and try again
- **Verify:** Middleware recognizes authenticated user

**Issue: Form doesn't respond to input**
- **Cause:** Component re-render issue or state problem
- **Debug:** Check React DevTools for state updates
- **Fix:** Ensure input `onChange` handlers are properly bound

### Logs to Check

**Browser Console:**
```javascript
// Look for these patterns
console.warn('Warning: Profile creation failed...')
console.error('Error at...')
[v0] // Debug logs if added
```

**Supabase Logs:**
- Real-time: Edge Function logs
- Query: SQL query performance
- Auth: Login success/failure events

**Application Logs:**
- Next.js server output
- API route logs
- Database trigger execution

---

## Rollback Plan

**If signup is broken:**

1. **Revert signup page:**
   ```bash
   git checkout HEAD~1 -- src/app/auth/signup/page.tsx
   ```

2. **Revert auth modules:**
   ```bash
   git checkout HEAD~1 -- src/lib/supabase/auth-client.ts
   git checkout HEAD~1 -- src/lib/supabase/auth.ts
   ```

3. **Database recovery:**
   - Keep new database schema (backward compatible)
   - Roll back trigger: `DROP TRIGGER on_auth_user_created`
   - Old code still works with new tables

4. **Verify:**
   - Test old signup still works
   - Manually create profiles for new users
   - No data loss in transition

---

## Post-Launch Monitoring

### Daily Checks

- [ ] Signup completion rate (target: > 80%)
- [ ] Signin success rate (target: > 95%)
- [ ] Database error logs (should be empty)
- [ ] User feedback/support tickets

### Weekly Analysis

- [ ] Signup funnel metrics
- [ ] Performance trending
- [ ] Security logs review
- [ ] User behavior patterns

### Monthly Review

- [ ] Feature usage statistics
- [ ] Improvement opportunities
- [ ] New feature planning
- [ ] Security assessment

---

## Success Criteria

All items must pass before considering deployment complete:

- [x] Database migrations executed successfully
- [x] Environment variables configured
- [ ] Signup form fully functional (account + profile)
- [ ] Signin form working with valid credentials
- [ ] Error scenarios handled gracefully
- [ ] Mobile responsiveness verified
- [ ] Accessibility standards met
- [ ] Security tests pass
- [ ] Performance targets met
- [ ] Cross-browser compatibility confirmed
- [ ] User documentation complete
- [ ] Team trained on new features

---

## Quick Links

- Supabase Dashboard: `https://supabase.com/dashboard`
- Auth Logs: `https://supabase.com/dashboard/project/[project-id]/auth/policies`
- Database Tables: `https://supabase.com/dashboard/project/[project-id]/editor`
- API Docs: `https://supabase.com/docs/reference/api`

---

## Support & Questions

For issues or questions:
1. Check the IMPLEMENTATION_SUMMARY.md file
2. Review AUTH_ARCHITECTURE.md for design details
3. Check database logs in Supabase
4. Review browser console for errors
5. Contact development team with logs/screenshots
