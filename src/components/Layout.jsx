import { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { Home, BarChart2, Settings, LogOut, Video, Bot, Mic, Brain } from "lucide-react";
import { useAuth } from '../hooks/useAuth.jsx';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isClient) {
    return null; // or a loading indicator
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-secondary text-secondary-foreground shadow-md p-4 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
        <h1 className="text-xl font-bold">AI Dashboard</h1>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className={`bg-secondary text-secondary-foreground w-64 flex-shrink-0 ${isSidebarOpen ? 'block' : 'hidden'} absolute inset-y-0 left-0 z-50 md:relative md:block transition-all duration-300 ease-in-out`}>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link to="/" className="flex items-center space-x-2 p-2 rounded hover:bg-primary/10" onClick={() => setIsSidebarOpen(false)}>
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="flex items-center space-x-2 p-2 rounded hover:bg-primary/10" onClick={() => setIsSidebarOpen(false)}>
                  <BarChart2 className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/koxy-ai" className="flex items-center space-x-2 p-2 rounded hover:bg-primary/10" onClick={() => setIsSidebarOpen(false)}>
                  <Bot className="h-5 w-5" />
                  <span>Koxy AI</span>
                </Link>
              </li>
              <li>
                <Link to="/vad" className="flex items-center space-x-2 p-2 rounded hover:bg-primary/10" onClick={() => setIsSidebarOpen(false)}>
                  <Mic className="h-5 w-5" />
                  <span>VAD</span>
                </Link>
              </li>
              <li>
                <Link to="/huggingface" className="flex items-center space-x-2 p-2 rounded hover:bg-primary/10" onClick={() => setIsSidebarOpen(false)}>
                  <Brain className="h-5 w-5" />
                  <span>Hugging Face</span>
                </Link>
              </li>
              <li>
                <Link to="/object-detection" className="flex items-center space-x-2 p-2 rounded hover:bg-primary/10" onClick={() => setIsSidebarOpen(false)}>
                  <Video className="h-5 w-5" />
                  <span>Object Detection</span>
                </Link>
              </li>
              <li>
                <Link to="/settings" className="flex items-center space-x-2 p-2 rounded hover:bg-primary/10" onClick={() => setIsSidebarOpen(false)}>
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
