import { lazy, Suspense } from "react";
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
import SiteLayout from "./components/ui/SiteLayout";
import SEO from "./components/ui/SEO";

const Login = lazy(() => import("./pages/public/Login"));
const SignUp = lazy(() => import("./pages/public/SignUp"));
const ForgotPassword = lazy(() => import("./pages/public/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/public/Dashboard"));
const BoardManager = lazy(() => import("./pages/protected/BoardManager"));
const AddBoard = lazy(() => import("./pages/protected/AddBoard"));
const BoardEdit = lazy(() => import("./pages/protected/BoardEdit"));
const NoteManager = lazy(() => import("./pages/protected/NoteManager"));
const AddNote = lazy(() => import("./pages/protected/AddNote"));
const NoteEdit = lazy(() => import("./pages/protected/NoteEdit"));
const NoteDetails = lazy(() => import("./pages/protected/NoteDetails"));
const TrashBoards = lazy(() => import("./pages/trash/TrashBoards"));
const TrashNotes = lazy(() => import("./pages/trash/TrashNotes"));
const NotFound = lazy(() => import("./pages/public/NotFound"));


function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <BoardProvider>
              <NoteProvider>
                <SiteLayout>
                  <SEO />
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
                </SiteLayout>
              </NoteProvider>
            </BoardProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
