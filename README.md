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

## 📂 Structure

```
src/
├── components/           # ColorPicker, PinInput, PINModal, BoardCard, NoteCard
├── contexts/            # AuthContext, BoardContext, NoteContext, ThemeContext
├── pages/              # Dashboard, AddBoard, BoardEdit, NoteManager, AddNote, NoteEdit
├── config/             # firebase.js
└── utils/              # PIN hash/verify, guestStorage
```

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
