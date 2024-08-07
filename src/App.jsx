import React from 'react';
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

const App = () => (
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

export default App;
