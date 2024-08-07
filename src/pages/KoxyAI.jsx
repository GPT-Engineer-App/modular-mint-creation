import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { koxyAPI } from 'koxy-js';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const api = useMemo(() => new koxyAPI("m1OlWDWBaw2r5FQrmWvWEdSW_S6unteHK4dS8RQk5VU.GW6sdI6y7UoVI9sOO6OVUuHlBjR77J5Zm17aWmHDBhw", "XCQCQtKOf8kU40mmAaKt1KUkiDObCADqLiUdkgr_-XA.dqqcfN_G2tYAVSvsetdwYinj0ayHsdpf21KMA1BtHc0"), []);

const KoxyAI = () => {
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [documentInput, setDocumentInput] = useState('');
  const [documentResponse, setDocumentResponse] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [queryResponse, setQueryResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);

  const handleChatSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const parameters = { message: chatInput };
      const result = await api.run("chat", parameters);
      setChatResponse(result.response);
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while processing your chat request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const parameters = { text: documentInput };
      const result = await api.run("embed_document", parameters);
      setDocumentResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while embedding the document.');
    } finally {
      setIsLoading(false);
    }
  }, [documentInput, api]);

  const handleQuerySubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const parameters = { query: queryInput };
      const result = await api.run("query_database", parameters);
      setQueryResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while querying the database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribe;
    if (api.realtime && typeof api.realtime.subscribe === 'function') {
      unsubscribe = api.realtime.subscribe('events', (event) => {
        setEvents((prevEvents) => [...prevEvents, event]);
      });
    } else {
      console.warn('Realtime subscription is not available');
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [api]);

  const memoizedEvents = useMemo(() => events, [events]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Koxy AI Integration</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
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
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Real-time Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 max-h-80 overflow-y-auto">
                {events.map((event, index) => (
                  <li key={index} className="border-b pb-2">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(event, null, 2)}</pre>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KoxyAI;
