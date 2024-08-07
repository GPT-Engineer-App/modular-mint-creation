import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from 'axios';

const KoxyAI = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await axios.post('https://api.koxy.ai/v1/chat/completions', {
        messages: [{ role: 'user', content: input }],
        model: 'gpt-3.5-turbo',
      }, {
        headers: {
          'Authorization': 'Bearer YOUR_KOXY_AI_API_KEY',
          'Content-Type': 'application/json',
        },
      });
      setResponse(result.data.choices[0].message.content);
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred while processing your request.');
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
