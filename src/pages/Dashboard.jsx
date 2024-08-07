import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { koxyAPI } from 'koxy-js';

const api = new koxyAPI("m1OlWDWBaw2r5FQrmWvWEdSW_S6unteHK4dS8RQk5VU.GW6sdI6y7UoVI9sOO6OVUuHlBjR77J5Zm17aWmHDBhw", "XCQCQtKOf8kU40mmAaKt1KUkiDObCADqLiUdkgr_-XA.dqqcfN_G2tYAVSvsetdwYinj0ayHsdpf21KMA1BtHc0");

const Dashboard = () => {
  const [counts, setCounts] = useState({});
  const [stats, setStats] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const countsResult = await api.run("get_counts", {});
        setCounts(countsResult);

        const statsResult = await api.run("get_stats", {});
        setStats(statsResult);

        const alertsResult = await api.run("get_alerts", {});
        setAlerts(alertsResult);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(counts).map(([key, value]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle>{key}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(counts).map((key, index) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={`hsl(${index * 30}, 70%, 50%)`} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {alerts.map((alert, index) => (
              <li key={index} className="bg-secondary p-2 rounded">
                {alert}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
