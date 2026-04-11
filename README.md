# 📔 Noteflow App

A premium React-based note and board management application with advanced features including drag-and-drop, PIN protection, priority levels, file attachments, and guest/authenticated user modes.

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router DOM
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Custom CSS with CSS Variables
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **State Management**: React Context API
- **Testing**: Vitest, React Testing Library
- **Icons**: React Icons
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios
- **UI Framework**: Bootstrap (minimal)

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
├── IMPLEMENTATION_GUIDE.md
├── index.html
├── package.json
├── README.md
├── tailwind.config.js
├── vite.config.js
├── public/
│   └── images/
├── src/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── ConfirmationModal.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── Footer.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── PageBackButton.jsx
│   │   ├── PinInput.jsx
│   │   ├── PINModal.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── ThemeToggle.test.jsx
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── boards/
│   │   │   ├── BoardCard.jsx
│   │   │   ├── BoardCard.test.jsx
│   │   │   └── BoardList.jsx
│   │   └── notes/
│   │       ├── NoteCard.jsx
│   │       └── NoteList.jsx
│   ├── config/
│   │   └── firebase.js
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   ├── BoardContext.jsx
│   │   ├── NoteContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/
│   │   ├── AddBoard.jsx
│   │   ├── AddNote.jsx
│   │   ├── BoardEdit.jsx
│   │   ├── BoardManager.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── NoteEdit.jsx
│   │   ├── NoteItem.jsx
│   │   ├── NoteManager.jsx
│   │   ├── NotFound.jsx
│   │   └── SignUp.jsx
│   ├── test/
│   │   └── setup.js
│   └── utils/
│       ├── guestStorage.js
│       └── helpers.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Firebase project with Firestore, Authentication, and Storage enabled
- Modern web browser

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd Multi-Notes-App
   ```

2. **Install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Firebase Setup**:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password provider)
   - Enable Firestore Database
   - Enable Storage
   - Get your Firebase config credentials

4. **Configure Firebase**:
   Update `src/config/firebase.js` with your Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
   };
   ```

### Running the Application

- **Development**:

  ```bash
  npm run dev
  # or
  yarn dev
  ```

  Runs on `http://localhost:5173`

- **Build for Production**:

  ```bash
  npm run build
  # or
  yarn build
  ```

- **Preview Production Build**:
  ```bash
  npm run preview
  # or
  yarn preview
  ```

### Testing

- **Run Tests**:

  ```bash
  npm test
  # or
  yarn test
  ```

- **Run Tests with UI**:

  ```bash
  npm run test:ui
  # or
  yarn test:ui
  ```

- **Run Tests Once**:

  ```bash
  npm run test:run
  # or
  yarn test:run
  ```

- **Linting**:
  ```bash
  npm run lint
  # or
  yarn lint
  ```

---

## 🎯 Feature Details

### ✨ 3D Glass Morphism Effects

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

## 📦 Dependencies

### Core Dependencies

- `react` ^18.3.1 - UI library
- `react-dom` ^18.3.1 - React DOM rendering
- `react-router-dom` ^7.0.2 - Routing
- `firebase` ^10.12.5 - Backend services
- `axios` ^1.7.2 - HTTP client
- `react-hot-toast` ^2.4.1 - Notifications
- `react-icons` ^5.6.0 - Icon library
- `bootstrap` ^5.3.3 - CSS framework

### Development Dependencies

- `@vitejs/plugin-react` ^4.3.1 - Vite React plugin
- `vite` ^5.3.4 - Build tool
- `tailwindcss` ^3.4.17 - Utility CSS
- `eslint` ^8.57.0 - Linting
- `vitest` ^4.1.3 - Testing framework
- `@testing-library/react` ^16.3.2 - React testing
- `@testing-library/jest-dom` ^6.9.1 - Jest DOM matchers
- And more...

---

## 🐛 Troubleshooting

### Firebase Connection Issues

- Verify config in `src/config/firebase.js`
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

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Support

For issues and questions:

1. Check [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for detailed info
2. Review troubleshooting section above
3. Verify Firebase configuration
4. Check browser console for errors

---

**Built with ❤️ using React, Firebase & Modern Web Technologies**
