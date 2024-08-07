import { Home, Info, Settings, Bot, Mic, Brain, Video } from "lucide-react";
import Index from "./pages/Index.jsx";
import EngineLabs from "./pages/EngineLabs";
import VAD from "./pages/VAD";
import HuggingFaceDemo from "./pages/HuggingFaceDemo";
import ObjectDetection from "./pages/ObjectDetection";

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
    title: "Engine Labs AI",
    to: "/engine-labs",
    icon: <Bot className="h-4 w-4" />,
    page: <EngineLabs />,
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
  {
    title: "Object Detection",
    to: "/object-detection",
    icon: <Video className="h-4 w-4" />,
    page: <ObjectDetection />,
  },
];
