import { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { BoardProvider } from "./contexts/BoardContext";
import { NoteProvider } from "./contexts/NoteContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Import Components and Routes
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import LoadingSpinner from "./components/ui/LoadingSpinner";

import Login from "./pages/public/Login";
import SignUp from "./pages/public/SignUp";
import ForgotPassword from "./pages/public/ForgotPassword";
import Dashboard from "./pages/public/Dashboard";

import BoardManager from "./pages/protected/BoardManager";
import AddBoard from "./pages/protected/AddBoard";
import BoardEdit from "./pages/protected/BoardEdit";
import NoteManager from "./pages/protected/NoteManager";
import AddNote from "./pages/protected/AddNote";
import NoteEdit from "./pages/protected/NoteEdit";
import NoteDetails from "./pages/protected/NoteDetails";
import TrashBoards from "./pages/trash/TrashBoards";
import TrashNotes from "./pages/trash/TrashNotes";
import NotFound from "./pages/public/NotFound";



function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <BoardProvider>
              <NoteProvider>
                <div className="main-content">
                  <Suspense
                    fallback={<LoadingSpinner message="Loading page..." />}
                  >
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<SignUp />} />
                      <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                      />


                      {/* Dashboard - Public Access (allows guest browsing) */}
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Navigate to="/" replace />} />

                      {/* Protected Routes */}
                      <Route
                        path="/boards"
                        element={
                          <ProtectedRoute>
                            <BoardManager />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/boards/add"
                        element={
                          <ProtectedRoute>
                            <AddBoard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/boards/edit/:id"
                        element={
                          <ProtectedRoute>
                            <BoardEdit />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/notes"
                        element={
                          <ProtectedRoute>
                            <NoteManager />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/notes/add"
                        element={
                          <ProtectedRoute>
                            <AddNote />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/notes/edit/:id"
                        element={
                          <ProtectedRoute>
                            <NoteEdit />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/notes/details/:id"
                        element={
                          <ProtectedRoute>
                            <NoteDetails />
                          </ProtectedRoute>
                        }
                      />

                      {/* Trash (UI-only, sessionStorage) */}
                      <Route path="/trash/boards" element={<TrashBoards />} />
                      <Route path="/trash/notes" element={<TrashNotes />} />

                      {/* Redirect unknown paths */}
                      <Route path="*" element={<NotFound />} />

                    </Routes>
                  </Suspense>
                </div>
              </NoteProvider>
            </BoardProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
