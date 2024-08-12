import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Mic, Brain, Video, BarChart2, Settings } from 'lucide-react';

const Index = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome to AI Dashboard</h1>
      <p className="text-base">Explore our AI-powered features:</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Koxy AI Chat", description: "Interact with our AI-powered chatbot.", link: "/koxy-ai", icon: Bot },
          { title: "Voice Activity Detection", description: "Detect voice in real-time audio.", link: "/vad", icon: Mic },
          { title: "Hugging Face Models", description: "Experiment with AI models.", link: "/huggingface", icon: Brain },
          { title: "Object Detection", description: "Detect objects in images and video.", link: "/object-detection", icon: Video },
          { title: "Dashboard", description: "View AI application analytics.", link: "/dashboard", icon: BarChart2 },
          { title: "Settings", description: "Configure AI tools and preferences.", link: "/settings", icon: Settings },
        ].map((item, index) => (
          <Card key={index} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {React.createElement(item.icon, { className: "h-6 w-6" })}
                <span>{item.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{item.description}</p>
              <Link to={item.link}>
                <Button className="mt-4 w-full">Open</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;
