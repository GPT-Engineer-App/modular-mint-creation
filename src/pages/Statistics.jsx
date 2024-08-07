import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { koxyAPI } from 'koxy-js';

const api = new koxyAPI("m1OlWDWBaw2r5FQrmWvWEdSW_S6unteHK4dS8RQk5VU.GW6sdI6y7UoVI9sOO6OVUuHlBjR77J5Zm17aWmHDBhw", "XCQCQtKOf8kU40mmAaKt1KUkiDObCADqLiUdkgr_-XA.dqqcfN_G2tYAVSvsetdwYinj0ayHsdpf21KMA1BtHc0");

const Statistics = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await api.run("get_advanced_stats", {});
        setStats(result);
      } catch (error) {
        console.error('Error fetching advanced stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Detailed Statistics</h1>

      <Card>
        <CardHeader>
          <CardTitle>System Efficiency</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="efficiency" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="errorRate" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Add more advanced metrics and visualizations as needed */}
    </div>
  );
};

export default Statistics;
