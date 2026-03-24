# Authentication System - User Flow & Architecture Guide

## Signup User Journey

```
┌─────────────────────────────────────────────────────────────┐
│ USER VISITS /auth/signup                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: ACCOUNT INFORMATION                                 │
│                                                              │
│ 📝 Full Name (Required)                                      │
│ 📧 Email (Required)                                          │
│ 🔐 Password (Required, min 8 chars)                         │
│ 🔐 Confirm Password (Required)                              │
│ 📱 Phone (Optional)                                          │
│                                                              │
│ Progress: [█████░░░░░] Step 1/2                            │
│ [Validate] → [Next] or [Back]                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
        PASSWORD STRENGTH INDICATOR
        Weak ↔ Acceptable ↔ Good ↔ Strong
                            ↓
     VALIDATION CHECKS
     ✓ Name not empty
     ✓ Valid email format
     ✓ Password 8+ chars
     ✓ Passwords match
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: FARM INFORMATION                                    │
│                                                              │
│ 🌾 Farm Name (Required)                                     │
│ 📍 Location (Required)                                      │
│ 📐 Hectares (Optional)                                      │
│                                                              │
│ Progress: [██████████] Step 2/2                            │
│ [Back] or [Register]                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
            FORM SUBMISSION
            - Validate all fields
            - Check farm data required
            - Parse numeric hectares
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ CLIENT: signUp() in auth-client.ts                          │
│ - Email, password → Supabase Auth                           │
│ - Profile data (name, phone, farm) in metadata             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ SERVER: signUp() in auth.ts                                 │
│ 1. Create auth user via Supabase                            │
│ 2. Extract user ID from response                            │
│ 3. Upsert profile record in profiles table:                 │
│    - fullName, phone, farmName, location, hectares          │
│ 4. Handle errors gracefully (non-blocking)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ DATABASE TRIGGER: handle_new_user()                         │
│ - Auto-creates profile row (backup)                         │
│ - Calls seed_default_categories(user_id)                    │
│ - Handles errors with warnings                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
        CREATE 11 DEFAULT CATEGORIES:
        EXPENSES: Insumos, Mano de obra, Mantenimiento,
                  Transporte, Agroquimicos, Herramientas,
                  Agua/Riego, Otros gastos
        INCOMES:  Venta de cosecha, Subsidios, Otros ingresos
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ SIGNUP SUCCESS                                               │
│ Redirect to /auth/signin?message=...                        │
│                                                              │
│ ✓ Auth user created in auth.users                           │
│ ✓ Profile created in profiles table                         │
│ ✓ 11 Default categories seeded                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Signin User Journey

```
┌─────────────────────────────────────────────────────────────┐
│ USER VISITS /auth/signin                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ SIGNIN FORM                                                  │
│                                                              │
│ 📧 Email (Required)                                          │
│ 🔐 Password (Required)                                      │
│    [Show/Hide password toggle icon]                         │
│                                                              │
│ [Remember this device] ✓                                    │
│                                                              │
│ [Forgot password?]                                          │
│                                                              │
│ [Sign In Button]                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
            VALIDATION CHECKS
            ✓ Email not empty
            ✓ Password not empty
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ CLIENT: signIn() in auth-client.ts                          │
│ - Send email/password to Supabase Auth                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
        SUPABASE AUTH VERIFICATION
        - Check credentials against auth.users
        - Generate session token
                            ↓
        ┌─ SUCCESS ──────────────────────┐
        │ Session established            │
        │ JWT token created              │
        │ Cookie stored (HTTP-only)      │
        └────────────────────────────────┘
                            ↓
        REDIRECT TO /dashboard
        - Auth middleware verifies token
        - User data available in layout/pages
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ DASHBOARD LOADED                                             │
│ User can access:                                             │
│ - Dashboard with financials                                 │
│ - Expenses & Incomes                                        │
│ - Categories                                                │
│ - Harvests & Activities                                     │
│ - Profile settings                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Architecture

### Signup Data Flow

```
USER INPUT (Client Form)
├── Account Step
│   ├── name: string
│   ├── email: string
│   ├── password: string
│   └── phone?: string
│
└── Profile Step
    ├── farmName: string
    ├── location: string
    └── hectares?: number
                  ↓
        SignUpProfileData Interface
        (Type-safe parameter object)
                  ↓
        signUp(email, password, profileData)
        in auth-client.ts (Browser)
                  ↓
        signUp(email, password, profileData)
        in auth.ts (Server)
                  ↓
        ┌─ Branch 1: Auth Creation
        │  await supabase.auth.signUp({
        │    email,
        │    password,
        │    options: { data: {...metadata} }
        │  })
        │
        └─ Branch 2: Profile Creation
           await supabase
             .from('profiles')
             .upsert({
               id: user.id,
               fullName: profileData.name,
               phone: profileData.phone,
               farmName: profileData.farmName,
               location: profileData.location,
               hectares: profileData.hectares
             })
```

### Database Tables

```
┌─────────────────────┐
│  auth.users         │
│  (Supabase Auth)    │
├─────────────────────┤
│ id (UUID, PK)       │
│ email               │
│ encrypted_password  │
│ raw_app_meta_data   │ ← Stores name, phone, farmName, location, hectares
│ created_at          │
│ updated_at          │
└──────┬──────────────┘
       │ 1:1 relationship
       │
       ↓
┌─────────────────────────┐
│  profiles               │
│  (User Profile Data)    │
├─────────────────────────┤
│ id (UUID, PK, FK)       │
│ fullName                │
│ phone                   │
│ farmName                │
│ location                │
│ hectares                │
│ avatarUrl               │
│ createdAt               │
│ updatedAt               │
└──────┬──────────────────┘
       │ 1:Many relationship
       │
       ├─────────────────────┐
       │                     │
       ↓                     ↓
┌────────────────┐   ┌────────────────┐
│  categories    │   │   expenses     │
│                │   │                │
├────────────────┤   ├────────────────┤
│ id (UUID)      │   │ id (UUID)      │
│ userId (FK)    │   │ userId (FK)    │
│ name           │   │ amount         │
│ type (enum)    │   │ category       │
│ color          │   │ date           │
│ isDefault      │   │ description    │
│ createdAt      │   │ createdAt      │
└────────────────┘   └────────────────┘

(Similar for incomes, harvests, activities)
```

---

## Error Handling Architecture

### Signup Error Scenarios

```
VALIDATION ERRORS (Client-side)
├── Empty fields → Display field-specific message
├── Password mismatch → "Passwords don't match"
├── Weak password → "Password must be 8+ chars"
└── Invalid email → "Enter a valid email"
                ↓
        USER CAN CORRECT AND RETRY

AUTH ERRORS (Server-side from Supabase)
├── Email already exists → "Email already registered"
├── Weak password rejected → Supabase error message
├── Rate limited → "Too many attempts, try again later"
└── Network error → "Connection failed, please retry"
                ↓
        USER SHOWN ERROR, CAN RETRY

PROFILE CREATION ERRORS
├── Database constraint → Logged as warning, non-blocking
├── Permission denied → Trigger fallback creates basic profile
└── RLS policy violation → Service role has override
                ↓
        SIGNUP SUCCEEDS, USER CAN LOGIN
        Categories may seed on first access if trigger failed

CATEGORY SEEDING ERRORS
├── Function not found → Trigger logs warning
├── User constraint violation → Ignored (ON CONFLICT DO NOTHING)
└── Permission denied → Trigger has SECURITY DEFINER role
                ↓
        SIGNUP COMPLETES
        Categories seed on demand when fetching (in getCategories)
```

### Signin Error Scenarios

```
VALIDATION ERRORS
├── Empty email → "Please enter your email"
├── Empty password → "Please enter your password"
└── Invalid email format → "Enter a valid email"
                ↓
        USER CORRECTS AND RETRIES

AUTH ERRORS
├── User not found → "Verify your credentials"
├── Wrong password → "Verify your credentials"
├── User not confirmed → "Email not verified"
└── Account disabled → "This account is disabled"
                ↓
        USER SHOWN GENERIC MESSAGE FOR SECURITY
        Suggests password recovery if needed
```

---

## Security Architecture

### Row Level Security (RLS)

```
PROFILES TABLE
├── SELECT: auth.uid() = id
├── INSERT: auth.uid() = id
├── UPDATE: auth.uid() = id
└── DELETE: auth.uid() = id
   (Users can only access their own profile)

CATEGORIES TABLE
├── SELECT: auth.uid() = "userId"
├── INSERT: auth.uid() = "userId"
├── UPDATE: auth.uid() = "userId"
└── DELETE: auth.uid() = "userId"
   (Users can only access their own categories)

(Same for expenses, incomes, harvests, activities)
```

### Function Permissions

```
seed_default_categories(user_id UUID)
├── SECURITY DEFINER
│   (Runs with owner permissions, not user permissions)
│
├── SET search_path = public
│   (Explicit schema to prevent injection)
│
├── Validation checks
│   (Null checks, user existence verification)
│
└── Exception handling
    (Logs warnings, doesn't fail on errors)

PERMISSIONS GRANTED:
├── authenticated role → EXECUTE
└── Service role (via trigger) → EXECUTE with elevated privileges
```

### Session Management

```
AUTH FLOW
1. Browser sends email/password
2. Supabase Auth validates
3. JWT token generated
4. Token stored in HTTP-only secure cookie
5. Token attached to requests automatically
6. Middleware verifies token
7. User data available throughout session

LOGOUT
1. Clear session from Supabase
2. Remove cookie from browser
3. Redirect to signin page
```

---

## Development Checklist

### Before Deployment

- [ ] Database migrations executed in order:
  1. Add categories & profiles tables
  2. Fix RLS & triggers
  3. Grant permissions

- [ ] Environment variables configured:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_URL (server-side)
  - SUPABASE_SERVICE_ROLE_KEY (server-side)

- [ ] Signup form tested:
  - [ ] 2-step flow works
  - [ ] Password strength indicator displays
  - [ ] Validation prevents moving forward without data
  - [ ] Profile data saved to profiles table
  - [ ] Categories seeded automatically

- [ ] Signin form tested:
  - [ ] Valid credentials work
  - [ ] Invalid credentials show error
  - [ ] Password visibility toggle works
  - [ ] Remember device option appears
  - [ ] Redirect to dashboard on success

- [ ] Responsive design verified:
  - [ ] Mobile (375px)
  - [ ] Tablet (768px)
  - [ ] Desktop (1024px+)

- [ ] Accessibility checked:
  - [ ] Labels associated with inputs
  - [ ] Focus states visible
  - [ ] Error messages accessible
  - [ ] Navigation keyboard-accessible

- [ ] Security verified:
  - [ ] Passwords never logged
  - [ ] HTTPS enforced
  - [ ] Session tokens secure
  - [ ] RLS policies active
  - [ ] CSRF protection enabled

---

## Monitoring & Observability

### Key Metrics to Track

```
SIGNUP FUNNEL
├── Visitors reaching signup page
├── Step 1 completions
├── Step 2 reach rate
├── Form submissions
├── Successful signups
└── Signup errors/dropoff points

SIGNIN METRICS
├── Signin attempts
├── Successful logins
├── Failed login reasons
├── Password reset requests
└── Session duration

DATABASE METRICS
├── Profile creation latency
├── Category seeding time
├── RLS policy performance
└── Trigger execution success rate
```

### Logging Points

```
// signup page
- Form validation failures
- Step transitions
- Submit attempts
- Errors returned from server

// auth-client.ts
- signUp called with parameters
- Response from Supabase
- Client-side errors

// auth.ts (server)
- signUp initiated
- Auth user created successfully
- Profile upsert attempted
- Profile creation errors (warnings)
- Final response to client

// Database triggers
- handle_new_user() execution
- seed_default_categories() success/warnings
- Any exceptions or constraint violations
```

---

## Future Enhancements

### Phase 2: Enhanced Security
- [ ] Email verification required before login
- [ ] Two-factor authentication (2FA)
- [ ] OAuth providers (Google, GitHub)
- [ ] Password reset flow with secure tokens
- [ ] Account lockout after failed attempts
- [ ] Activity logging and audit trail

### Phase 3: User Experience
- [ ] Social signup (continue with Google)
- [ ] Profile picture upload
- [ ] Auto-fill from previous sessions
- [ ] Personalized onboarding
- [ ] Profile completion progress tracker
- [ ] Email address change/verification

### Phase 4: Administration
- [ ] User management dashboard
- [ ] Role-based access control (RBAC)
- [ ] Bulk user operations
- [ ] User account statistics
- [ ] Compliance & data export

---

This architecture provides a solid foundation for secure, scalable user authentication with excellent user experience.
