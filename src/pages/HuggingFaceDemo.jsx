import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "@gradio/client";

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
      const client = await Client.connect("janasumit2911/BottlesCansClassify");
      const result = await client.predict("/predict", { 		
        params: input, 
      });
      setResponse(JSON.stringify(result.data, null, 2));
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bottles and Cans Classifier Demo</h1>
      <Card>
        <CardHeader>
          <CardTitle>Image Classification</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter image URL"
              className="w-full"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Classifying...' : 'Classify Image'}
            </Button>
          </form>
          {error && (
            <div className="mt-4 text-red-500">{error}</div>
          )}
          {response && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Classification Result:</h2>
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
