import { Home, Info, Settings, Bot, Mic, Brain } from "lucide-react";
import Index from "./pages/Index.jsx";
import KoxyAI from "./pages/KoxyAI";
import VAD from "./pages/VAD";
import HuggingFaceDemo from "./pages/HuggingFaceDemo";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "About",
    to: "/about",
    icon: <Info className="h-4 w-4" />,
    page: <div>About Page</div>,
  },
  {
    title: "Settings",
    to: "/settings",
    icon: <Settings className="h-4 w-4" />,
    page: <div>Settings Page</div>,
  },
  {
    title: "Koxy AI",
    to: "/koxy-ai",
    icon: <Bot className="h-4 w-4" />,
    page: <KoxyAI />,
  },
  {
    title: "VAD",
    to: "/vad",
    icon: <Mic className="h-4 w-4" />,
    page: <VAD />,
  },
  {
    title: "Hugging Face",
    to: "/huggingface",
    icon: <Brain className="h-4 w-4" />,
    page: <HuggingFaceDemo />,
  },
];
