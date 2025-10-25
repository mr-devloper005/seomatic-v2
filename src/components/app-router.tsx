import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
// import { ProtectedRoute } from "./protected-route";
import { PublicRoute } from "./public-route";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Layout } from "./app-sidebar-layout";
import HomePage from "@/pages/home";
import UsersPage from "@/pages/users";
import LoginPage from "@/pages/login";
import SubscriptionPage from "@/pages/subscriptions";
import SettingsPage from "@/pages/settings";
import BotsPage from "@/pages/bots";
import ContentPage from "@/pages/content";
import ContentEditorPage from "@/pages/content/editor";

export function AppRouter() {
  const { isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner text="Loading application..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - only accessible to unauthenticated users */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
           {/* <Route index element={<HomePage />} /> */}

        <Route path="/" element={<Layout />}>
  <Route path="users" element={<UsersPage />} />
  <Route path="subscriptions" element={<SubscriptionPage />} />
  <Route path="settings" element={<SettingsPage />} />
  <Route path="bots" element={<BotsPage />} />

  <Route path="content" element={<ContentPage />} />
  <Route path="content/editor" element={<ContentEditorPage />} />

  {/* optional: keep /editor as alias */}
  <Route path="editor" element={<ContentEditorPage />} />
</Route>


        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
