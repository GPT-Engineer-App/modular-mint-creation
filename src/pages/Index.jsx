import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from 'react-router-dom';

const Index = () => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4">
        <h1 className="text-2xl font-bold">My App with Koxy AI</h1>
      </header>
      
      <main className="flex-grow container mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Welcome to our Koxy AI-powered app!</h2>
        <div className="space-y-4">
          <p>This app now integrates with Koxy AI to provide intelligent responses.</p>
          <Link to="/koxy-ai">
            <Button>Try Koxy AI Chat</Button>
          </Link>
        </div>
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">Quick Input Demo:</h3>
          <Input 
            type="text" 
            placeholder="Enter some text" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button onClick={() => alert(`You entered: ${inputValue}`)}>
            Submit
          </Button>
        </div>
      </main>
      
      <footer className="bg-secondary text-secondary-foreground p-4 text-center">
        <p>&copy; 2024 My App with Koxy AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
