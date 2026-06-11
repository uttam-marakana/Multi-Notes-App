# Multi-Notes-App 🎨✨

Premium React notes app with **dynamic colors**, **PIN protection**, **glassmorphism UI**, **Firebase backend**, and **auto re-lock**.

## 🚀 Quick Start

```bash
yarn
yarn dev
```

**Live**: http://localhost:5173

## 🌟 Features

### 🎨 **Premium UI/UX**

- **Glassmorphism** - Frosted blur effects, 3D transforms, glow animations
- **Light/Dark Theme** - System preference + toggle
- **Smooth Animations** - 300ms cubic-bezier transitions
- **Responsive** - Mobile/Tablet/Desktop

### 🎯 **Dynamic Colors**

- Unlimited HSL/hex palette (`ColorPicker.jsx`)
- Boards & Notes custom colors
- Live preview on click

### 🔐 **PIN Security** (4-digit)

- **Board/Note Protection** - Individual PINs
- Theme-aware glass inputs
- Hover scale/glow effects
- Error shake + danger feedback
- **Auto Re-lock** - Dashboard clears access

### 📝 **Notes & Boards** (Firebase Firestore)

```
Flat `notes` collection structure:
notes/{id}
├─ boardId (reference)
├─ ownerId (user scoping)
├─ title/content (your data!)
├─ priority (low/med/high colors)
├─ files[] (JPG/PNG/GIF/PDF)
├─ order (drag-drop reorder)
└─ pinnedBy, createdAt, etc.
```

- **Full CRUD** - Create/Edit/Delete/Reorder
- **Real-time sync** - Live updates
- **File Uploads** - Firebase Storage (user/board scoped)
- **Secure Queries** - `where(boardId + ownerId) + orderBy(order)`

### 👥 **Authentication**

- **Firebase Auth** - Email/Password + persistent
- **Guest Mode** - sessionStorage fallback

## 📱 Demo Flow

1. Login/Dashboard
2. Create **colored board** → **PIN protect**
3. Add **priority note** + files → PIN
4. Theme toggle → PINs adapt
5. Drag-drop reorder → auto-save
6. Dashboard → **All re-locked**

## 📂 Folder Structure (Reorganized)

The app is split into **feature folders** (boards/notes/auth) and **routing layers** (public/protected/trash).

```txt
src/
├── components/
│   ├── ui/                      # Pure UI primitives (buttons, modals, skeletons)
│   │   ├── *.jsx                # e.g. ThemeToggle, Drawer, Pagination, etc.
│   ├── common/                  # Shared non-feature UI used across boards/notes/pages
│   │   ├── *.jsx                # e.g. SearchWithSuggestions
│   ├── auth/                    # Auth-related UI wrappers
│   │   └── ProtectedRoute.jsx
│   ├── boards/                  # Board-specific presentational components
│   │   ├── BoardCard.jsx
│   │   └── BoardList.jsx
│   └── notes/                   # Note-specific presentational components
│       ├── NoteCard.jsx
│       └── NoteList.jsx
│
├── pages/
│   ├── public/                 # Routes accessible without protection
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── SignUp.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── NotFound.jsx
│   ├── protected/              # Routes requiring auth
│   │   ├── BoardManager.jsx
│   │   ├── AddBoard.jsx
│   │   ├── BoardEdit.jsx
│   │   ├── NoteManager.jsx
│   │   ├── AddNote.jsx
│   │   ├── NoteEdit.jsx
│   │   ├── NoteDetails.jsx
│   │   └── NoteItem.jsx
│   └── trash/                  # SessionStorage / archived views
│       ├── TrashBoards.jsx
│       └── TrashNotes.jsx
│
├── contexts/                   # React Context providers (app state)
│   ├── AuthContext.jsx
│   ├── BoardContext.jsx
│   ├── NoteContext.jsx
│   └── ThemeContext.jsx
│
├── config/                     # Third-party initialization (Firebase)
│   └── firebase.js
│
├── services/                   # (Reserved) server/data services layer
├── state/                      # (Reserved) state management (non-context)
├── constants/                  # (Reserved) app-wide constants
├── types/                      # (Reserved) shared types
│
├── hooks/                       # Reusable hooks (pagination/debounce)
│   ├── useDebouncedValue.js
│   └── usePagination.js
│
├── lib/                         # (Reserved) shared pure helpers
│
└── utils/                      # Shared pure utilities
    ├── helpers.js               # PIN hashing/verification, protected-access, formatting
    ├── guestStorage.js
    └── trashStorage.js
```

### Directory conventions
- **components/**: UI only. Business logic lives in **contexts/** (Firebase CRUD) or **pages/** (screen composition).
- **pages/**: route “screens” only. No low-level storage calls in pages.
- **contexts/**: Firebase reads/writes, subscriptions, and derived state.
- **utils/**: small pure helpers used by contexts/components.


## 🛠 Tech Stack

| Category | Tech                              |
| -------- | --------------------------------- |
| Frontend | React 18 + Vite + Tailwind        |
| Backend  | Firebase (Auth/Firestore/Storage) |
| State    | React Context                     |
| Styling  | CSS Vars + Glassmorphism          |

## 🚀 Setup

1. **Firebase Console**:
   - New project → Enable Auth (Email/Password), Firestore, Storage
   - `.env` → Copy Web SDK config:
     ```
     VITE_FIREBASE_API_KEY=...
     VITE_FIREBASE_AUTH_DOMAIN=...
     # etc (8 vars)
     ```
2. `yarn dev`

## ⚠️ Firestore Index (First Run)

Chrome console shows **index creation link** for `boardId+ownerId+order` query:

```
1. Copy link from console
2. Click → Firebase Console → Indexes → CREATE → DEPLOY
```

**One-time** (2min) → Queries fast forever!

## 📖 Commands

```bash
yarn dev         # Development
yarn build       # Production build
yarn test        # Unit tests
yarn lint        # ESLint
```

## 🎉 Recent Updates

- **Flat `notes` collection** + boardId reference (all notes data stored)
- **Secure multi-field queries** + ownership validation
- **File uploads** + priority colors + PINs + reorder
- **Production ready** glassmorphism UI

**Test now**: localhost:5173 → Full flow works! 🚀
