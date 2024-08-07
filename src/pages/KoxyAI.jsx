import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { koxyAPI } from 'koxy-js';
import { Alert, AlertDescription } from "@/components/ui/alert";

const api = new koxyAPI("m1OlWDWBaw2r5FQrmWvWEdSW_S6unteHK4dS8RQk5VU.GW6sdI6y7UoVI9sOO6OVUuHlBjR77J5Zm17aWmHDBhw");

const KoxyAI = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      console.log('Sending request to Koxy API:', input);
      const parameters = {
        message: input
      };
      const result = await api.run("chat", parameters);
      console.log('Received response from Koxy API:', result);
      setResponse(result.response);
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while processing your request. Please try again.');
      setResponse('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Koxy AI Chat</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your message"
          className="w-full"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {response && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Response:</h2>
          <Textarea
            value={response}
            readOnly
            className="w-full h-40"
          />
        </div>
      )}
    </div>
  );
};

export default KoxyAI;
