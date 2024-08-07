import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Home, BarChart2, Settings, LogOut } from "lucide-react";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      <aside className={`bg-secondary text-secondary-foreground w-64 flex-shrink-0 ${isSidebarOpen ? '' : 'hidden'} md:block`}>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Recycling Dashboard</h1>
          <nav>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="flex items-center space-x-2 p-2 rounded hover:bg-primary/10">
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/statistics" className="flex items-center space-x-2 p-2 rounded hover:bg-primary/10">
                  <BarChart2 className="h-5 w-5" />
                  <span>Statistics</span>
                </Link>
              </li>
              <li>
                <Link to="/settings" className="flex items-center space-x-2 p-2 rounded hover:bg-primary/10">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-secondary text-secondary-foreground shadow-md p-4 flex justify-between items-center">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-4 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
