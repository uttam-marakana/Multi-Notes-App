import { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { BoardProvider } from "./contexts/BoardContext";
import { NoteProvider } from "./contexts/NoteContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Import Components and Routes
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import BoardManager from "./pages/BoardManager";
import AddBoard from "./pages/AddBoard";
import BoardEdit from "./pages/BoardEdit";
import NoteManager from "./pages/NoteManager";
import AddNote from "./pages/AddNote";
import NoteEdit from "./pages/NoteEdit";
import NotFound from "./pages/NotFound";

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

                      {/* Redirect unknown paths to login */}
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
