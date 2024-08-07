import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthProvider } from './hooks/useAuth';
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import ObjectDetection from "./pages/ObjectDetection";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import KoxyAI from "./pages/KoxyAI";
import VAD from "./pages/VAD";
import HuggingFaceDemo from "./pages/HuggingFaceDemo";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/object-detection" element={<ObjectDetection />} />
                <Route path="/koxy-ai" element={<KoxyAI />} />
                <Route path="/vad" element={<VAD />} />
                <Route path="/huggingface" element={<HuggingFaceDemo />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </NextThemesProvider>
  </QueryClientProvider>
);

export default App;
