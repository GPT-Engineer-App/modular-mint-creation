import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://cors-anywhere.herokuapp.com/https://backengine-nqhbcnzf.fly.dev/api',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  },
});

const Settings = () => {
  const [settings, setSettings] = useState({
    alertThreshold: '1',
    detectionSensitivity: '0.2',
    alertThresholdEnabled: true,
    detectionSensitivityEnabled: true,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(prevSettings => ({
          ...prevSettings,
          ...response.data,
          alertThreshold: response.data.alertThreshold || '1',
          detectionSensitivity: response.data.detectionSensitivity || '0.2',
          alertThresholdEnabled: response.data.alertThresholdEnabled !== undefined ? response.data.alertThresholdEnabled : true,
          detectionSensitivityEnabled: response.data.detectionSensitivityEnabled !== undefined ? response.data.detectionSensitivityEnabled : true,
        }));
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to fetch settings. Using default values.');
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name) => {
    setSettings(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await api.put('/settings', settings);
      if (response.status === 200) {
        setError('Settings updated successfully');
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      if (error.response && error.response.status === 403) {
        setError('Access denied. Please check your authentication or permissions.');
      } else {
        setError('Failed to update settings. Please check your connection and try again.');
      }
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="alertThresholdEnabled" className="text-sm font-medium text-gray-700">
                  Enable Alert Threshold
                </Label>
                <Switch
                  id="alertThresholdEnabled"
                  checked={settings.alertThresholdEnabled}
                  onCheckedChange={() => handleSwitchChange('alertThresholdEnabled')}
                />
              </div>
              {settings.alertThresholdEnabled && (
                <div>
                  <Label htmlFor="alertThreshold" className="block text-sm font-medium text-gray-700">
                    Alert Threshold
                  </Label>
                  <Input
                    type="number"
                    id="alertThreshold"
                    name="alertThreshold"
                    value={settings.alertThreshold}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    The alert threshold determines the point at which the system will trigger an alert. 
                    For example, if set to 5, an alert will be triggered when 5 or more objects are detected.
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="detectionSensitivityEnabled" className="text-sm font-medium text-gray-700">
                  Enable Detection Sensitivity
                </Label>
                <Switch
                  id="detectionSensitivityEnabled"
                  checked={settings.detectionSensitivityEnabled}
                  onCheckedChange={() => handleSwitchChange('detectionSensitivityEnabled')}
                />
              </div>
              {settings.detectionSensitivityEnabled && (
                <div>
                  <Label htmlFor="detectionSensitivity" className="block text-sm font-medium text-gray-700">
                    Detection Sensitivity
                  </Label>
                  <Input
                    type="number"
                    id="detectionSensitivity"
                    name="detectionSensitivity"
                    value={settings.detectionSensitivity}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Detection sensitivity adjusts how easily the system detects objects. 
                    A higher value increases sensitivity, potentially detecting more objects but also increasing false positives. 
                    A lower value decreases sensitivity, potentially missing some objects but reducing false positives.
                  </p>
                </div>
              )}
            </div>
            <Button type="submit">Save Settings</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
