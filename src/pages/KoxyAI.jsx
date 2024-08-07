import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.enginelabs.ai/v1',
  headers: {
    'Authorization': 'Bearer YOUR_ENGINE_LABS_API_KEY',
    'Content-Type': 'application/json'
  }
});

// Add a response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Server responded with error:", error.response.status, error.response.data);
      if (error.response.status === 429) {
        // Implement exponential backoff here
        // For simplicity, we'll just wait for 5 seconds before retrying
        return new Promise(resolve => {
          setTimeout(() => resolve(api(error.config)), 5000);
        });
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

const KoxyAI = () => {
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [documentInput, setDocumentInput] = useState('');
  const [documentResponse, setDocumentResponse] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [queryResponse, setQueryResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChatSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/chat', { message: chatInput });
      setChatResponse(response.data.response);
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.status === 502) {
        setError('The server is currently unavailable. Please try again later.');
      } else {
        setError('An error occurred while processing your chat request.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [chatInput]);

  const handleDocumentSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/embed', { text: documentInput });
      setDocumentResponse(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while embedding the document.');
    } finally {
      setIsLoading(false);
    }
  }, [documentInput]);

  const handleQuerySubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/query', { query: queryInput });
      setQueryResponse(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while querying the database.');
    } finally {
      setIsLoading(false);
    }
  }, [queryInput]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Engine Labs AI Integration</h1>
      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="document">Document Embedding</TabsTrigger>
          <TabsTrigger value="query">Database Query</TabsTrigger>
        </TabsList>
        <TabsContent value="chat">
          <form onSubmit={handleChatSubmit} className="space-y-4">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Enter your message"
              className="w-full"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </form>
          {chatResponse && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Response:</h2>
              <Textarea
                value={chatResponse}
                readOnly
                className="w-full h-40"
              />
            </div>
          )}
        </TabsContent>
        <TabsContent value="document">
          <form onSubmit={handleDocumentSubmit} className="space-y-4">
            <Textarea
              value={documentInput}
              onChange={(e) => setDocumentInput(e.target.value)}
              placeholder="Enter document text to embed"
              className="w-full h-40"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Embedding...' : 'Embed Document'}
            </Button>
          </form>
          {documentResponse && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Embedding Result:</h2>
              <Textarea
                value={documentResponse}
                readOnly
                className="w-full h-40"
              />
            </div>
          )}
        </TabsContent>
        <TabsContent value="query">
          <form onSubmit={handleQuerySubmit} className="space-y-4">
            <Input
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Enter your database query"
              className="w-full"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Querying...' : 'Query Database'}
            </Button>
          </form>
          {queryResponse && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Query Result:</h2>
              <Textarea
                value={queryResponse}
                readOnly
                className="w-full h-40"
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default KoxyAI;
