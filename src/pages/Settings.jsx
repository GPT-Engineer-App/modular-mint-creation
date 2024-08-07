import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { koxyAPI } from 'koxy-js';

const api = new koxyAPI("m1OlWDWBaw2r5FQrmWvWEdSW_S6unteHK4dS8RQk5VU.GW6sdI6y7UoVI9sOO6OVUuHlBjR77J5Zm17aWmHDBhw", "XCQCQtKOf8kU40mmAaKt1KUkiDObCADqLiUdkgr_-XA.dqqcfN_G2tYAVSvsetdwYinj0ayHsdpf21KMA1BtHc0");

const Settings = () => {
  const [settings, setSettings] = useState({
    alertThreshold: '',
    detectionSensitivity: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await api.run("get_settings", {});
        setSettings(result);
      } catch (error) {
        console.error('Error fetching settings:', error);
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
    try {
      await api.run("update_settings", settings);
      alert('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
