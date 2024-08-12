import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthProvider } from './hooks/useAuth.jsx';
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import ObjectDetection from "./pages/ObjectDetection";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import EngineLabs from "./pages/KoxyAI";
import VAD from "./pages/VAD";
import HuggingFaceDemo from "./pages/HuggingFaceDemo";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Add viewport meta tag for mobile responsiveness
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
    document.getElementsByTagName('head')[0].appendChild(meta);

    // Add apple-mobile-web-app-capable meta tag for iOS devices
    const appleMeta = document.createElement('meta');
    appleMeta.name = 'apple-mobile-web-app-capable';
    appleMeta.content = 'yes';
    document.getElementsByTagName('head')[0].appendChild(appleMeta);

    // Add theme-color meta tag for Android devices
    const themeMeta = document.createElement('meta');
    themeMeta.name = 'theme-color';
    themeMeta.content = '#000000'; // Set this to match your app's theme color
    document.getElementsByTagName('head')[0].appendChild(themeMeta);
  }, []);

  return (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <React.Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/object-detection" element={<React.Suspense fallback={<div>Loading Object Detection...</div>}><ObjectDetection /></React.Suspense>} />
                  <Route path="/engine-labs" element={<React.Suspense fallback={<div>Loading Engine Labs AI...</div>}><EngineLabs /></React.Suspense>} />
                  <Route path="/vad" element={<React.Suspense fallback={<div>Loading VAD...</div>}><VAD /></React.Suspense>} />
                  <Route path="/huggingface" element={<React.Suspense fallback={<div>Loading Hugging Face Demo...</div>}><HuggingFaceDemo /></React.Suspense>} />
                </Route>
              </Routes>
            </React.Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  </AuthProvider>
);

const AppExport = App;
export { AppExport as default };
