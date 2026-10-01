# Noteflow — Multi Notes App

Noteflow is a production-oriented React + Firebase notes workspace for creating boards, organizing rich-text notes, attaching files, protecting private content with PINs, and synchronizing changes in real time.

The application uses a **Glass UI / glassmorphism design system**, responsive layouts, accessible motion effects, reusable application shell components, Firebase security rules, and route-aware SEO metadata.

> **Verification note:** source-level checks and static audits have been performed. Run `npm install`, `npm run lint`, `npm run test:run`, and `npm run build` in a normal development/CI environment before deployment.

---

## Features

### Workspace

- Boards for organizing related notes
- Notes scoped to boards
- Search and pagination
- Pin boards and notes
- Drag/reorder notes
- Duplicate boards and notes
- Trash views
- Guest browsing/local guest state
- Real-time Firebase synchronization

### Rich Notes

Notes support:

- Bold
- Italic
- Underline
- Strikethrough
- Headings
- Bullet lists
- Numbered lists
- Checklists
- Alignment
- Blockquotes
- Code blocks
- Links
- Horizontal rules
- Undo / redo

Rich content is sanitized before rendering. Existing plain-text notes remain supported for backward compatibility.

### Attachments

- Firebase Storage uploads
- Image/PDF attachments
- Board/note-scoped Storage paths
- Unique attachment filenames
- Board/note clone operations create independent Storage objects
- Lazy-loaded attachment thumbnails

### Authentication

- Firebase Email/Password authentication
- Protected routes
- Persistent Firebase authentication sessions
- Guest mode for public browsing
- Password reset flow
- Protected-access timeout/relock behavior

### Content Protection

Boards and notes can be protected with a 4-digit PIN.

The current PIN implementation uses:

- PBKDF2-SHA256
- Random per-record salt
- 120,000 PBKDF2 iterations
- Versioned stored hash format
- Legacy PIN verification compatibility
- Automatic protected-access re-locking

Firebase Firestore/Storage authorization remains the actual backend security boundary. PIN protection is an additional application-level access layer, not a replacement for Firebase Security Rules.

### UI / UX

- Project-wide Glass UI
- Light/dark themes
- Responsive desktop/tablet/mobile layouts
- Shared header and footer
- Subtle card/button motion
- Reduced-motion accessibility support
- Responsive rich-text toolbar
- Loading/error/empty states

---

## SEO

The application is a client-rendered SPA, so SEO is intentionally focused on the public Home page while private application screens are marked `noindex, nofollow`.

### Implemented

- Semantic document title
- Route-aware meta descriptions
- Route-aware robots directives
- Canonical URLs
- Open Graph metadata
- Twitter card metadata
- `WebApplication` JSON-LD structured data on the public Home page
- `robots.txt`
- `sitemap.xml`
- Web App Manifest
- Descriptive fallback metadata in `index.html`
- SEO-friendly Home page `<h1>` and semantic sections
- Private dashboard/workspace routes excluded from indexing
- Lazy-loaded route chunks for better initial loading performance

SEO metadata is managed centrally by:

```text
src/components/ui/SEO.jsx
```

The public application URL is configured with:

```env
VITE_APP_URL=https://your-domain.com
```

The production build generates `robots.txt` and `sitemap.xml` from this value using:

```text
scripts/generate-seo.mjs
```

Only the public `/` route is included in the sitemap because boards, notes, trash, and account screens are private/user-specific application content.

### Important SPA SEO limitation

This project does not use server-side rendering or static pre-rendering. Search engines that require HTML content before JavaScript execution may receive the application shell rather than fully rendered page content.

For a highly search-driven public marketing site, consider a future SSR/SSG architecture such as Next.js. For this private notes product, indexing the authenticated workspace would not be desirable, so the current route-aware SPA strategy is appropriate.

---

## Production Engineering

The project includes several production-oriented optimizations.

### Code splitting

Application routes are loaded with `React.lazy()` and `Suspense`, so users do not download every protected/trash screen before visiting it.

```text
App.jsx
  ↓
React.lazy()
  ↓
Route chunk
  ↓
Suspense fallback
```

### Vite build optimization

`vite.config.js` configures:

- ES2020 browser target
- CSS code splitting
- Separate React/router chunk
- Separate Firebase chunk
- Separate UI/dependency chunk
- Production sourcemaps disabled by default
- Tailwind v4 Vite integration

### Asset loading

- Note attachment thumbnails use lazy loading.
- Images include decoding hints where appropriate.
- The application avoids loading the entire route tree eagerly.

### Error handling

A global `ErrorBoundary` protects the React tree from uncaught rendering failures.

Firebase configuration is validated at startup so missing environment variables fail with an actionable message instead of an opaque SDK initialization error.

### Dependency hygiene

Unused `axios` dependency was removed because the application does not use it.

---

## Glass UI System

The application uses shared CSS variables and reusable glass surfaces instead of styling each screen independently.

Core visual properties include:

```css
--glass-blur
--glass-blur-heavy
--glass-border
--glass-highlight
--glass-shadow
--glass-shadow-hover
```

Shared glass surfaces include:

- Header
- Footer
- Navigation
- Dashboard hero
- Statistics cards
- Board cards
- Note cards
- Forms
- Modals
- Drawers
- Search panels
- Rich-text editor
- Empty states
- Loading states

The design uses translucency, blur, borders, highlights, gradients, and controlled depth rather than opaque cards everywhere.

---

## Motion & Interaction

The project uses a lightweight CSS motion system rather than adding a dedicated animation dependency.

- Glass cards use subtle entrance and hover movement.
- Buttons use hover lift and press feedback.
- Icon controls use small scale/translate feedback.
- Navigation uses an animated active/hover indicator.
- Motion respects `prefers-reduced-motion: reduce`.
- Animation is deliberately restrained so note editing and drag/drop remain comfortable.

---

## Responsive Breakpoints

The global responsive system is defined in `src/index.css`.

| Breakpoint | Purpose |
|---|---|
| `1200px` | Wide desktop / compact desktop adjustments |
| `992px` | Tablet landscape / compact navigation |
| `768px` | Tablet/mobile transition |
| `576px` | Mobile layout |
| `400px` | Small-phone optimization |

Responsive behavior covers:

- Header navigation
- Dashboard hero
- Board/note grids
- Forms
- Buttons and action groups
- Modals and drawers
- PIN inputs
- Rich-text toolbar
- Attachment previews
- Authentication screens
- Footer

---

## Application Architecture

```text
Browser
  │
  ▼
src/main.jsx
  │
  ▼
App.jsx
  │
  ├── ErrorBoundary
  ├── BrowserRouter
  ├── ThemeProvider
  ├── AuthProvider
  ├── BoardProvider
  ├── NoteProvider
  │
  └── SiteLayout
       │
       ├── SEO
       ├── SiteHeader
       ├── Route content
       └── SiteFooter
```

### Data flow

```text
React Page
   ↓
Feature Component
   ↓
Context
   ↓
Firebase SDK
   ↓
Firestore / Storage / Auth
```

The contexts are the primary application data layer. Pages focus on screen composition and user interaction rather than directly implementing Firebase CRUD logic.

---

## Folder Structure

```text
Multi-Notes-App-main/
│
├── firebase/
│   ├── firestore.rules
│   └── storage.rules
│
├── public/
│   ├── favicon.png
│   ├── robots.txt
│   └── site.webmanifest
│
├── scripts/
│   └── generate-seo.mjs
│
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── auth/
│   │   ├── boards/
│   │   ├── common/
│   │   ├── notes/
│   │   └── ui/
│   │       ├── RichTextContent.jsx
│   │       ├── RichTextEditor.jsx
│   │       ├── SEO.jsx
│   │       ├── SiteFooter.jsx
│   │       ├── SiteHeader.jsx
│   │       └── SiteLayout.jsx
│   ├── config/
│   │   └── firebase.js
│   ├── contexts/
│   ├── hooks/
│   ├── pages/
│   │   ├── public/
│   │   ├── protected/
│   │   └── trash/
│   ├── test/
│   ├── utils/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .env
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## Firebase Data Model

### Boards

```text
boards/{boardId}
├── userId
├── name
├── description
├── color
├── isProtected
├── pinHash
├── pinnedBy[]
├── createdAt
└── updatedAt
```

### Notes

Notes use a flat Firestore collection and reference their parent board.

```text
notes/{noteId}
├── boardId
├── ownerId
├── title
├── content
├── priority
├── files[]
├── order
├── isProtected
├── pinHash
├── pinnedBy[]
├── createdAt
└── updatedAt
```

The application intentionally uses `ownerId` for notes and `userId` for boards. Firestore rules enforce the corresponding ownership model.

---

## Firebase Storage

Attachments use a user/board/note-oriented path:

```text
{userId}/
└── boards/
    └── {boardId}/
        └── notes/
            └── {uniqueFileName}
```

Cloning a note or board creates independent Storage objects so deleting an attachment from the original does not invalidate the clone.

---

## Security Rules

Security-sensitive operations are enforced by Firebase rules in addition to frontend checks.

Important ownership requirements include:

- Board ownership is immutable during updates.
- Note `ownerId` is immutable during updates.
- Note `boardId` cannot be changed through normal note updates.
- Note access requires ownership.
- Storage access is scoped to the authenticated user's Storage path.
- Protected UI access expires and is re-established through the PIN flow.

Always deploy and test Firestore/Storage rules in the Firebase project before production use.

---

## Environment Configuration

Create `.env` from `.env.example`.

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_APP_URL=https://your-domain.com
```

`VITE_FIREBASE_MEASUREMENT_ID` is optional.

`VITE_APP_URL` should be the canonical HTTPS URL in production. It is used for canonical metadata, Open Graph URLs, JSON-LD, `robots.txt`, and `sitemap.xml`.

> **Security:** never place Firebase Admin SDK credentials, service-account private keys, or server-only secrets in `VITE_*` variables. Vite exposes those values to browser code.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

Enable in Firebase:

- Authentication → Email/Password
- Firestore Database
- Storage

Copy the Firebase Web App configuration into `.env`.

### 3. Start development

```bash
npm run dev
```

### 4. Lint

```bash
npm run lint
```

### 5. Run tests

```bash
npm run test:run
```

### 6. Build for production

```bash
npm run build
```

The production build also generates:

```text
robots.txt
sitemap.xml
```

using `VITE_APP_URL`.

### 7. Preview production build

```bash
npm run preview
```

---

## Deployment Checklist

Before deploying:

- [ ] Configure production Firebase environment variables.
- [ ] Configure `VITE_APP_URL` with the real HTTPS domain.
- [ ] Deploy Firestore Security Rules.
- [ ] Deploy Storage Security Rules.
- [ ] Confirm Firebase Authentication providers are configured.
- [ ] Run `npm run lint`.
- [ ] Run `npm run test:run`.
- [ ] Run `npm run build`.
- [ ] Verify `dist/robots.txt` contains the production sitemap URL.
- [ ] Verify `dist/sitemap.xml` contains the production canonical URL.
- [ ] Verify `/` has `index, follow` metadata.
- [ ] Verify authenticated routes have `noindex, nofollow` metadata.
- [ ] Configure SPA fallback/rewrite rules on the hosting provider so React Router URLs resolve to `index.html`.
- [ ] Test authentication, Firestore CRUD, Storage uploads, PIN protection, and clone/delete behavior against the production Firebase project.

---

## Hosting Notes

Because this is a Vite single-page application, the hosting provider must rewrite unknown application routes to `index.html`.

Examples of the required behavior:

```text
/                 → index.html
/login            → index.html
/boards           → index.html
/notes            → index.html
/notes/details/x  → index.html
```

Static files such as `robots.txt`, `sitemap.xml`, `favicon.png`, and `site.webmanifest` must remain directly accessible.

Configure HTTP security headers at the hosting/CDN layer rather than attempting to put server-only headers inside React code. At minimum, evaluate:

- Content-Security-Policy
- Referrer-Policy
- X-Content-Type-Options
- Permissions-Policy
- Strict-Transport-Security on HTTPS

The exact CSP should be derived from the final Firebase/hosting configuration rather than copied blindly, because Firebase Auth, Storage, Analytics, and the chosen hosting provider may require specific origins.

---

## Important Development Notes

### Tailwind

Tailwind CSS v4 is enabled through `@tailwindcss/vite` in `vite.config.js`.

### Bootstrap

Bootstrap's CDN CSS/JS was removed so it cannot compete with the Glass UI design system.

### Header and Footer

Every route is wrapped by:

```text
SiteLayout
├── SEO
├── SiteHeader
├── Route content
└── SiteFooter
```

### Rich-text content

Use `RichTextEditor` for editing and `RichTextContent` for rendering.

Do not render user-provided HTML directly outside the existing sanitized rich-content path.

---

## Current Production Status

The project has been hardened and structured for production-oriented development, but **deployment readiness still requires environment-specific verification**.

The remaining validation should be performed against the actual Firebase project and hosting provider:

1. Install dependencies.
2. Run lint.
3. Run the complete test suite.
4. Run a production build.
5. Test Firebase Authentication.
6. Test Firestore Security Rules.
7. Test Storage Security Rules and uploads.
8. Test rich-text persistence/rendering.
9. Test responsive layouts.
10. Validate generated SEO files and metadata with the production domain.
