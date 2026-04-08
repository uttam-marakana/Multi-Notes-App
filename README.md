# 📔 Multi-Notes App

A premium React-based note and board management application with advanced features including drag-and-drop, PIN protection, priority levels, file attachments, and guest/authenticated user modes.

## ✨ Key Features

### 🎨 Premium 3D Glass Morphism UI

- **Glass Morphism Design**: Frosted glass effect with backdrop-filter blur (10-20px)
- **3D Transforms**: Perspective effects with rotateX/Y animations, shadow depth
- **Advanced Animations**:
  - Floating entrance (floatIn, floatUp with keyframes)
  - Glow pulse effects with smooth color transitions
  - Gradient shifting backgrounds (15s cycle)
  - Scale and rotate transformations on interactions
  - Shimmer animations across surfaces
  - Border glow animations with color transitions
- **Gradient Overlays**: Linear (135deg) and radial gradients for premium depth
- **Shadow Hierarchy**: Multi-layered shadows (inset + outer) for elevation
- **Interactive Effects**: Cubic-bezier transitions, hover lifts, color glows

### 🎨 User Experience

- **Premium UI/UX**: Modern interface with smooth 0.3s cubic-bezier animations
- **Light/Dark Theme**: Toggle with persistent localStorage, glass theme adaptation
- **Responsive Design**: Mobile-first (480px, 768px, 1024px breakpoints)
- **Toast Notifications**: Real-time feedback with react-hot-toast

### 📊 Board Management

- Create, edit, delete boards with color selection
- PIN protection with 4-digit codes
- Drag-and-drop reordering
- Pin/favorite boards separately
- View all notes in a board

### 📝 Note Management

- Create, edit, delete notes with rich content
- Priority levels (Low, Medium, High)
- PIN protection for sensitive notes
- Drag-and-drop note reordering
- File attachments (JPG, PNG, GIF, PDF)
- Inline attachment previews with thumbnails

### 🔐 Security & Access Control

- Firebase Authentication (Email/Password)
- User-specific data isolation
- Owner-only edit/delete operations
- Read-only mode for non-owners
- Confirmation dialogs for destructive actions

### 👥 Guest Mode

- Browse dashboard without authentication
- Temporary data storage using sessionStorage
- Auto-clear data on tab/browser close
- Prompt to login before saving permanently
- Transition seamlessly to authenticated mode

### 💾 Data Management

- **Logged-in Users**: All data persisted to Firebase Firestore
- **Guest Users**: Temporary storage (session-based)
- Real-time data synchronization
- File storage via Firebase Storage

---

## 🏗️ Project Structure

```
Multi-Notes-App/
├── public/                          # Static assets
│   └── images/                      # App images
│
├── src/
│   ├── App.jsx                      # Main app component with routing
│   ├── App.css                      # App-level styles
│   ├── main.jsx                     # Vite entry point
│   ├── index.css                    # Global styles (500+ lines with CSS variables)
│   │
│   ├── components/                  # Reusable React components
│   │   ├── ThemeToggle.jsx          # Light/Dark theme switcher button
│   │   ├── PINModal.jsx             # 4-digit PIN input modal with numpad
│   │   ├── ConfirmationModal.jsx    # Reusable confirmation dialog
│   │   ├── ErrorBoundary.jsx        # Error boundary wrapper
│   │   ├── LoadingSpinner.jsx       # Loading indicator
│   │   │
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx   # Route protection for authenticated users
│   │   │
│   │   ├── boards/
│   │   │   ├── BoardCard.jsx        # Individual board display card
│   │   │   │   # Features: color indicator, PIN badge, pinned status, actions
│   │   │   └── BoardList.jsx        # Board list grid with drag-drop support
│   │   │       # Features: grouping (pinned/unpinned), reordering
│   │   │
│   │   └── notes/
│   │       ├── NoteCard.jsx         # Individual note display with attachments
│   │       │   # Features: priority indicator, file preview, read-only badge
│   │       └── NoteList.jsx         # Note list grid with drag-drop support
│   │           # Features: grouping (pinned/unpinned), filtering by priority
│   │
│   ├── contexts/                    # React Context API for state management
│   │   ├── ThemeContext.jsx         # Theme colors and toggle state
│   │   │   # Colors: light/dark theme CSS variables
│   │   │   # Persistence: localStorage
│   │   │
│   │   ├── AuthContext.jsx          # User authentication state
│   │   │   # Functions: signUp, login, logout, refreshUser
│   │   │   # Integration: Firebase Auth
│   │   │
│   │   ├── BoardContext.jsx         # Board CRUD & management
│   │   │   # Functions: addBoard, updateBoard, deleteBoard
│   │   │   # Features: PIN hashing, ownership tracking, drag-drop order
│   │   │
│   │   └── NoteContext.jsx          # Note CRUD & management
│   │       # Functions: addNote, updateNote, deleteNote
│   │       # Features: Priority handling, PIN protection, file uploads
│   │       # File Management: Firebase Storage integration
│   │
│   ├── pages/                       # Full page components (lazy-loaded)
│   │   ├── Login.jsx                # Sign in page with redirect support
│   │   ├── SignUp.jsx               # User registration page
│   │   ├── Dashboard.jsx            # Main dashboard with guest/auth modes
│   │   │   # Shows: Welcome message, login prompt for guests
│   │   │   # Includes: BoardManager component
│   │   │
│   │   ├── BoardManager.jsx         # Board CRUD interface
│   │   │   # Features: Create, list, edit, delete boards
│   │   │   # Guest mode: sessionStorage temporary storage
│   │   │
│   │   ├── AddBoard.jsx             # Board creation form
│   │   │   # Fields: name, description, color, PIN, protection
│   │   │
│   │   ├── BoardEdit.jsx            # Board editing page
│   │   │   # Features: Update board properties, PIN verification
│   │   │
│   │   ├── NoteManager.jsx          # Note CRUD interface
│   │   │   # Features: List notes for a board, filter/sort
│   │   │   # Guest mode: sessionStorage temporary storage
│   │   │
│   │   ├── AddNote.jsx              # Note creation form
│   │   │   # Fields: title, content, priority, PIN, file attachments
│   │   │   # Validation: File type, size, PIN match
│   │   │
│   │   ├── NoteEdit.jsx             # Note editing page
│   │   │   # Features: Update note, manage attachments
│   │   │
│   │   ├── NoteItem.jsx             # Note detail/view component
│   │   │
│   │   └── NotFound.jsx             # 404 error page
│   │
│   ├── firebase/
│   │   └── firebase.jsx             # Firebase configuration & exports
│   │       # Exports: auth, db, storage, analytics
│   │       # Config: API key, project ID, storage bucket
│   │
│   ├── utils/
│   │   ├── helpers.js               # Utility functions
│   │   │   # Functions: hashPIN, verifyPIN, formatDate, truncateText
│   │   │   # Functions: getFileIcon, formatFileSize, getPriorityColor
│   │   │
│   │   └── guestStorage.js          # Guest data sessionStorage utility
│   │       # Functions: saveBoards, getNotes, clearAll
│   │       # Features: Auto-clear on tab close, data isolation
│   │
│   └── assets/
│       ├── images/                  # Image assets
│       └── icons/                   # Icon assets
│
├── index.html                       # HTML entry point
├── package.json                     # Dependencies & scripts
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind (if used)
├── .eslintrc.cjs                    # ESLint rules
├── .gitignore                       # Git ignore rules
├── README.md                        # This file
└── IMPLEMENTATION_GUIDE.md          # Detailed implementation notes
```

---

## 🎯 Feature Details

### ✨ 3D Glass Morphism Effects (NEW!)

- **Frosted Glass Panels**: Semi-transparent surfaces with 10-20px blur effect
- **Depth & Elevation**:
  - Multi-layered shadows (outer + inset)
  - 3D perspective transforms on hover
  - Color-coded glow auras (primary/secondary)
  - Smooth cubic-bezier easing (0.23, 1, 0.320, 1)
- **Interactive Light**:
  - Gradient overlays (135deg directional)
  - Shimmer effects with infinite animations
  - Glow pulse on primary actions
  - Border color transitions
- **Premium Animations**:
  - Floating entrance with opacity fade
  - 3D rotation effects (rotateX for modals)
  - Gradient shifting (15s continuous)
  - Icon animations with floatUp
  - Scale/lift on hover (3-8px movement)

### 🔐 PIN Protection

- **4-digit security**: Modal with numpad UI
- **Hashing**: PIN hashed before storage (secure)
- **Boards**: Optional PIN for board access
- **Notes**: Optional PIN for note visibility
- **Verification**: Real-time validation feedback

### 📂 File Management

- **Supported formats**: JPG, PNG, GIF, PDF
- **Storage**: Firebase Storage
- **Limits**: Max 10 files per note
- **Preview**: Inline thumbnails for images, icons for PDFs
- **Organization**: Attachment count badge in note cards

### 🎨 Theme System

#### Colors Included

- **Light Theme**: Blue primary, white surfaces
- **Dark Theme**: Light blue primary, dark surfaces
- **Priority Colors**: Green (Low), Amber (Medium), Red (High)
- **Status Colors**: Success, Danger, Warning, Info

#### Priority Indicators

- Visual border color on cards
- Sorting support (high priority first)
- Color-coded badges

### 👤 Authentication Modes

#### Guest Mode

- Browse boards and notes
- Create/edit/delete with temporary storage
- Data cleared on tab/browser close
- Prompted to login before permanent save
- Full feature access except persistence

#### Authenticated Mode

- All operations saved to Firebase Firestore
- Persistent across sessions
- Real-time synchronization
- User isolation (only see own data)
- Ownership-based access control

### 📱 Responsive Breakpoints

| Breakpoint | Screen Size    | Layout                          |
| ---------- | -------------- | ------------------------------- |
| Desktop    | 1024px+        | 3-4 column grids, full features |
| Tablet     | 768px - 1024px | 2 column grids, touch-optimized |
| Mobile     | < 768px        | 1 column, stacked forms         |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Firebase project with Firestore & Auth enabled
- Modern web browser

### Installation

```bash
# Clone repository
git clone <repo-url>
cd Multi-Notes-App

# Install dependencies
yarn install
# or
npm install
```

### Configuration

1. **Firebase Setup**:
   - Create Firebase project at https://firebase.google.com
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Storage
   - Get your config credentials

2. **Update Firebase Config**:
   ```javascript
   // src/firebase/firebase.jsx
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_ID",
     appId: "YOUR_APP_ID",
   };
   ```

### Running Development Server

```bash
yarn dev
# or
npm run dev
```

Server runs on `http://localhost:5173`

### Building for Production

```bash
yarn build
# or
npm run build
```

Output in `dist/` directory

### Preview Production Build

```bash
yarn preview
# or
npm run preview
```

---

## 📦 Dependencies

### Core

- **React 18**: UI framework
- **React Router**: Page routing
- **Vite**: Build tool

### State Management

- **React Context API**: Built-in state management

### Backend & Auth

- **Firebase**: Authentication, Firestore, Storage
- **Firebase Auth**: User management
- **Firebase Firestore**: Real-time database
- **Firebase Storage**: File storage

### UI & Interactions

- **react-hot-toast**: Toast notifications
- **react-beautiful-dnd**: Drag-and-drop
- **Tailwind CSS**: Utility-first styling (optional)

### Utilities

- **react-hot-toast**: Error & success messages

---

## 🔄 Data Flow

### Board Creation Flow

1. User clicks "New Board"
2. Guest mode prompts login
3. Form opens with color & PIN options
4. Submit validates inputs
5. **Logged-in**: Saves to Firestore
6. **Guest**: Saves to sessionStorage
7. UI updates with new board

### Note Attachment Flow

1. User selects file(s) in note form
2. Validation: Check file type & size
3. Display selected file preview
4. On submit:
   - **Logged-in**: Upload to Firebase Storage, store URL in Firestore
   - **Guest**: Store file in state (lost on close)
5. Display attachment in note card with thumbnail

### PIN Protection Flow

1. User sets 4-digit PIN
2. PIN hashed before storage
3. On access, PIN Modal opens
4. User enters PIN
5. Hash compared to stored hash
6. Grant/deny access

---

## 🔒 Security Features

### Authentication

- Firebase Email/Password auth
- Session-based token management
- Protected routes block unauthorized access

### Data Security

- User data isolated by UID
- Firestore security rules (board/note ownership)
- PIN hashing with custom algorithm

### Ownership Verification

- `ownerId` stored with each board/note
- Edit/delete only available to owners
- Access control enforced in UI & context

### Confirmation Dialogs

- Delete operations require confirmation
- Modify operations show confirmation modal
- Prevent accidental data loss

---

## 🎨 Styling Architecture

### CSS Variables (index.css)

```css
Colors & Primary:
--color-primary: #3b82f6
--color-secondary: #8b5cf6
--color-background: #f9fafb
--color-surface: #ffffff

Premium Glass Morphism Effects:
--glass-bg: rgba(255, 255, 255, 0.95)
--glass-border: rgba(255, 255, 255, 0.3)
--glow-primary: 0 0 20px rgba(59, 130, 246, 0.3)
--glow-secondary: 0 0 20px rgba(139, 92, 246, 0.3)

Spacing:
--spacing-xs: 0.25rem
--spacing-sm: 0.5rem
--spacing-md: 1rem
--spacing-lg: 1.5rem
--spacing-xl: 2rem
--spacing-2xl: 3rem

Radius:
--radius-sm: 0.375rem
--radius-md: 0.5rem
--radius-lg: 1rem
--radius-xl: 1.5rem

Shadows (Layered):
--shadow-sm: 0 1px 2px 0 var(--color-shadow)
--shadow-md: 0 4px 6px -1px var(--color-shadow)
--shadow-lg: 0 10px 15px -3px var(--color-shadow)
--shadow-xl: 0 20px 25px -5px var(--color-shadow)
```

### Glass Morphism Utilities

- **`.glass-container`**: Base glass effect with `backdrop-filter: blur(10px)`
- **`.glass-card`**: Interactive glass with glow on hover, blur(15px) upgrade
- **`.glass-panel`**: Inset glass for nested containers with inner shadows
- **Backdrop Filter**: `-webkit-backdrop-filter` for Safari/iOS support
- **Border Glow**: `rgba(59, 130, 246, 0.5)` with pulsing animation

### Premium Animations

```css
@keyframes floatIn        /* Entrance: fade + lift 30px */
@keyframes floatUp        /* Continuous: ±5px vertical float */
@keyframes glowPulse      /* Shadow glow pulsing (0.3 → 0.5) */
@keyframes shimmer        /* Light shine sweep effect */
@keyframes scaleIn        /* Scale entrance: 0.95 → 1 */
@keyframes rotateIn       /* 3D rotate: rotateX(90deg) → 0 */
@keyframes slideInLeft    /* Slide from left: -50px */
@keyframes slideInRight   /* Slide from right: +50px */
@keyframes gradientShift  /* Animated bg gradient (15s cycle) */
@keyframes borderGlow     /* Border color + shadow pulsing */

Timing: cubic-bezier(0.23, 1, 0.320, 1) for smooth easing;
```

### Component Glass Effects

- **Cards**: `backdrop-filter: blur(10px)`, glow shadow, perspective 3D
- **Buttons**: Gradient BG, shimmer overlay, 3px lift on hover, glow(0.6)
- **Inputs**: Glass BG, animated border-glow on focus, opacity transition
- **Modals**: Backdrop blur(5px), glass panel, inset border highlight
- **Navbar**: Sticky glass, blur(10px)+inset, gradient text
- **Auth Pages**: Gradient BG (400% 400%), animated elements with floatUp
- **Form Groups**: Animation stagger with floatIn (0.6s)
- **Featured Items**: Icon animation with floatUp (3s infinite)

---

## 📊 Database Schema (Firestore)

### Users Collection

```javascript
/users/{userId}
└── email: String
    createdAt: Timestamp
    theme: String (light|dark)
```

### Boards Collection

```javascript
/users/{userId}/boards/{boardId}
├── name: String
├── description: String
├── color: String (hex)
├── ownerId: String
├── pinnedBy: Array[userId]
├── isProtected: Boolean
├── pin: String (hashed)
├── order: Number
├── createdAt: Timestamp
└── updatedAt: Timestamp

/boards/{boardId}/notes/{noteId}
├── title: String
├── content: String
├── priority: String (low|medium|high)
├── pinnedBy: Array[userId]
├── isProtected: Boolean
├── pin: String (hashed)
├── ownerId: String
├── files: Array[{
│   ├── name: String
│   ├── type: String
│   ├── size: Number
│   ├── url: String (Firebase Storage URL)
│   ├── path: String (Storage path)
│   └── uploadedAt: Timestamp
│}]
├── order: Number
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

---

## 🧪 Testing & Quality

### Current Setup

- ESLint for code quality
- Vite with HMR for fast development
- Building verified with yarn build

### Recommended Testing

```bash
# Unit tests (Jest + React Testing Library)
yarn test

# End-to-end tests (Cypress)
yarn test:e2e

# Linting
yarn lint

# Build check
yarn build
```

---

## 🚀 Deployment

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init

# Deploy
firebase deploy
```

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Environment Variables

Create `.env.local`:

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 📚 API Reference

### Theme Context

```javascript
const { colors, priorityColors, theme, toggleTheme } = useTheme();
```

### Auth Context

```javascript
const { currentUser, login, logout, signUp, loading } = useAuth();
```

### Board Context

```javascript
const { boards, addBoard, deleteBoard, updateBoard, loading } = useBoard();
```

### Note Context

```javascript
const { notes, addNote, deleteNote, updateNote, toggleNotePin } = useNote();
```

### Guest Storage

```javascript
import { guestStorage } from "@/utils/guestStorage";
guestStorage.saveBoards(boards);
guestStorage.getNotes(boardId);
guestStorage.clearAll();
```

---

## 🐛 Troubleshooting

### Firebase Connection Issues

- Verify config in `src/firebase/firebase.jsx`
- Check storage bucket format: `project.appspot.com`
- Enable required Firebase services in console

### PIN Not Working

- Ensure PIN is exactly 4 digits
- Check hashing function matches verification
- Verify PIN is being saved to database

### Guest Data Not Persisting

- Confirm sessionStorage is enabled
- Check browser privacy settings
- Data clears intentionally on tab close

### File Upload Fails

- Check file type (JPG, PNG, GIF, PDF only)
- Verify Firebase Storage is enabled
- Check storage rules allow uploads

---

## 📈 Performance Optimization

### Implemented

- Lazy-loaded page components
- React Context for efficient state management
- CSS variables for theme switching
- Minimal re-renders with memoization

### Recommended

- Code splitting for routes
- Image optimization
- Caching strategies
- Database indexing in Firestore

---

## 📝 Notes

### Guest Mode Behavior

- **Storage**: sessionStorage (tab-specific)
- **Persistence**: Lost on tab/window close
- **Data**: Isolated from other guests
- **Upgrade**: All data must be recreated after login

### Ownership Rules

- Board/note owner can edit/delete
- Non-owners see read-only UI
- Access control in both UI & backend
- Enforced through ownerId field

### PIN Security

- Hashed before storage (not plaintext)
- 4-digit minimum length
- Verified on access attempts
- Can be changed by owner only

---

## 📄 License

MIT License - Free to use and modify

---

## 🤝 Support

For issues and questions:

1. Check IMPLEMENTATION_GUIDE.md for detailed info
2. Review troubleshooting section above
3. Verify Firebase configuration
4. Check browser console for errors

---

## 🎉 What's Included

✅ Complete React application  
✅ Firebase integration (Auth, Firestore, Storage)  
✅ Drag-and-drop functionality  
✅ Light/Dark theme system  
✅ PIN protection  
✅ Guest & authenticated modes  
✅ File attachments  
✅ Priority management  
✅ Responsive design  
✅ Confirmation dialogs  
✅ Real-time updates  
✅ Premium UI/UX

---

## 🚧 Future Enhancements

- [ ] User profile management
- [ ] Board/note sharing with other users
- [ ] Collaborative editing
- [ ] Full-text search
- [ ] Tag/category system
- [ ] Export to PDF/JSON
- [ ] Backup & restore
- [ ] Mobile app (React Native)
- [ ] Offline support (PWA)
- [ ] Advanced analytics

---

**Built with ❤️ using React, Firebase & Modern Web Technologies**
