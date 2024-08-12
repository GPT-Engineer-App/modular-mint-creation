import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "@gradio/client";

const HuggingFaceDemo = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setImageUrl(input);

    try {
      const client = await Client.connect("janasumit2911/BottlesCansClassify");
      const result = await client.predict("/predict", [input]);
      setResponse(result.data);
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
          {imageUrl && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Input Image:</h2>
              <img src={imageUrl} alt="Input" className="mx-auto object-cover max-w-full h-auto" />
            </div>
          )}
          {response && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Classification Result:</h2>
              <p className="mb-2">The model has classified the image as:</p>
              <ul className="list-disc list-inside">
                {response.map((item, index) => (
                  <li key={index} className="mb-1">
                    <span className="font-semibold">{item.label}</span>: {(item.confidence * 100).toFixed(2)}% confidence
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HuggingFaceDemo;
