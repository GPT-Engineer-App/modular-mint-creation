import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { koxyAPI } from 'koxy-js';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const api = new koxyAPI("m1OlWDWBaw2r5FQrmWvWEdSW_S6unteHK4dS8RQk5VU.GW6sdI6y7UoVI9sOO6OVUuHlBjR77J5Zm17aWmHDBhw", "XCQCQtKOf8kU40mmAaKt1KUkiDObCADqLiUdkgr_-XA.dqqcfN_G2tYAVSvsetdwYinj0ayHsdpf21KMA1BtHc0");

const KoxyAI = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);

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
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Koxy AI Chat</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
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
