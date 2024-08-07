import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from 'axios';

const HuggingFaceDemo = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await axios.post(
        'https://api-inference.huggingface.co/models/gpt2',
        { inputs: input },
        {
          headers: {
            'Authorization': 'Bearer YOUR_HUGGING_FACE_API_KEY',
            'Content-Type': 'application/json',
          },
        }
      );
      setResponse(result.data[0].generated_text);
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Hugging Face Inference API Demo</h1>
      <Card>
        <CardHeader>
          <CardTitle>Text Generation with GPT-2</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a prompt for text generation"
              className="w-full"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Text'}
            </Button>
          </form>
          {error && (
            <div className="mt-4 text-red-500">{error}</div>
          )}
          {response && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Generated Text:</h2>
              <Textarea
                value={response}
                readOnly
                className="w-full h-40"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HuggingFaceDemo;
