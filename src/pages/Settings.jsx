import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://cors-anywhere.herokuapp.com/https://backengine-nqhbcnzf.fly.dev/api',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

const Settings = () => {
  const [settings, setSettings] = useState({
    alertThreshold: '',
    detectionSensitivity: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to fetch settings. Please try again later.');
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.put('/settings', settings);
      setError('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant={error.includes('successfully') ? 'default' : 'destructive'} className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="alertThreshold" className="block text-sm font-medium text-gray-700">
                Alert Threshold
              </label>
              <Input
                type="number"
                id="alertThreshold"
                name="alertThreshold"
                value={settings.alertThreshold}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="detectionSensitivity" className="block text-sm font-medium text-gray-700">
                Detection Sensitivity
              </label>
              <Input
                type="number"
                id="detectionSensitivity"
                name="detectionSensitivity"
                value={settings.detectionSensitivity}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <Button type="submit">Save Settings</Button>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
