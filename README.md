# Multi-Notes-App 🎨✨

Premium React notes app with **dynamic color pickers**, **PIN protection**, **glass morphism UI**, and **auto re-lock**.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

**Live**: http://localhost:5174

## 🌟 Features

### 🎨 **Premium UI/UX**

- **Glass Morphism** - Frosted blur effects, 3D transforms, glow animations
- **Light/Dark Theme** - Toggle + CSS vars, system preference
- **Smooth Animations** - Scale, rotate, glow pulse, shimmer (300+ms cubic-bezier)
- **Responsive** - Mobile/Tablet/Desktop breakpoints

### 🎯 **Dynamic Colors** (NEW!)

- **Unlimited Palette** - HSL rainbow + hex picker (`ColorPicker.jsx`)
- **Boards**: Any color for create/edit
- **Notes**: Priority + custom colors
- **Live Preview** - Click swatch → apply instantly

### 🔐 **PIN Security**

- 4-digit PINs for boards/notes
- **Theme-aware inputs** - Glass containers swap on toggle
- **Hover Effects** - Scale 1.05-1.08 + primary glow/shadow
- **Backspace Nav** - Between digits
- **Error Shake** + danger glow
- **PINModal** - Premium delete/edit gates

### 📋 **Boards & Notes**

- Create/Edit/Delete with drag-drop reorder
- **File Attachments** - JPG/PNG/GIF/PDF (Firebase Storage)
- **Priority Levels** - Color-coded (Low/Green, Med/Amber, High/Red)
- **Auto Re-lock** - Dashboard clears access (no manual)

### 👥 **Auth Modes**

- **Guest**: Temporary sessionStorage, auto-clear
- **Auth**: Firebase persistent

## 📱 Demo Flow

1. **Dashboard** → Auto-locks all
2. **Unlock PIN** → Edit board/note with **dynamic colors**
3. **Theme Toggle** → Pins swap vividly
4. **Hover Pins** → Scale + glow
5. **Dashboard** → Re-locked!

## 📂 File Structure

```
src/
├── components/
│   ├── ColorPicker.jsx        # Dynamic colors ✨
│   ├── PinInput.jsx          # Theme-aware PINs
│   ├── PINModal.jsx          # Verification
│   ├── BoardCard.jsx         # Boards w/ colors
│   └── NoteCard.jsx          # Notes w/ priorities
├── contexts/                 # Auth/Board/Note/Theme
├── pages/                   # All routes
├── utils/                   # PIN hash, revokeAccess
└── index.css               # 2500+ lines styling
```

## 🛠 Tech Stack

| Category  | Tech                               |
| --------- | ---------------------------------- |
| Framework | React 18 + Vite                    |
| Styling   | Tailwind + Custom CSS Vars         |
| Backend   | Firebase (Auth/Firestore/Storage)  |
| State     | React Context                      |
| UI        | Glass morphism, 3D transforms      |
| UX        | react-hot-toast, smooth animations |

## 📖 Commands

```bash
npm run dev     # Development (5174)
npm run build   # Production
npm test        # Tests
npm run lint    # Linting
```

## 🎨 Dynamic Colors Demo

**AddBoard/AddNote/BoardEdit/NoteEdit** all use `<ColorPicker>`:

```
24+ HSL palette + live hex picker
Click swatch → instant preview
Theme-adaptive (light/dark)
Hover scale + shadow
```

## 🔧 Firebase Setup

1. [Firebase Console](https://console.firebase.google.com/)
2. Enable **Auth** (Email/Password)
3. Enable **Firestore** + **Storage**
4. Update `src/config/firebase.js`

## 🎉 What's New

- **Dynamic Colors** - Unlimited palette (create/edit)
- **Pin UI Perfect** - Theme/hover/shake/delete
- **Auto Re-lock** - Dashboard clears all access
- **Optimized** - No unused files/code

**Ready for production!** Test: localhost:5174 🎊
