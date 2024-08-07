import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to AI Dashboard</h1>
      <p className="text-lg">Explore our various AI-powered features and tools:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Koxy AI Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Interact with our AI-powered chatbot using the Koxy API.</p>
            <Link to="/koxy-ai">
              <Button className="mt-4">Try Koxy AI</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voice Activity Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Detect voice activity in real-time audio streams.</p>
            <Link to="/vad">
              <Button className="mt-4">Explore VAD</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hugging Face Models</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Experiment with various AI models from Hugging Face.</p>
            <Link to="/huggingface">
              <Button className="mt-4">Try Models</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Object Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Detect and classify objects in images and video streams.</p>
            <Link to="/object-detection">
              <Button className="mt-4">Detect Objects</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View analytics and statistics for your AI applications.</p>
            <Link to="/dashboard">
              <Button className="mt-4">View Dashboard</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Configure your AI tools and application preferences.</p>
            <Link to="/settings">
              <Button className="mt-4">Manage Settings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
