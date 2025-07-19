"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [dbStatus, setDbStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [apiMessage, setApiMessage] = useState('');
  const [dbMessage, setDbMessage] = useState('');

  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      // Test basic API connection
      const testResult = await apiClient.testConnection();
      setApiStatus('success');
      setApiMessage(testResult.message);
    } catch (error) {
      setApiStatus('error');
      setApiMessage(error instanceof Error ? error.message : 'Unknown error');
    }

    try {
      // Test database connection
      const dbResult = await apiClient.testDatabaseConnection();
      setDbStatus('success');
      setDbMessage(`Database connected. Found ${dbResult.length} clients.`);
    } catch (error) {
      setDbStatus('error');
      setDbMessage(error instanceof Error ? error.message : 'Database connection failed');
    }
  };

  const getStatusIcon = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">API Integration Test</h1>
        <p className="text-muted-foreground">
          Testing connection to your FastAPI backend
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(apiStatus)}
              API Connection
            </CardTitle>
            <CardDescription>
              Testing basic API connectivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{apiMessage}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(dbStatus)}
              Database Connection
            </CardTitle>
            <CardDescription>
              Testing database connectivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{dbMessage}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button onClick={testApiConnection}>
          Test Again
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/clients')}>
          Go to Clients
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/properties')}>
          Go to Properties
        </Button>
      </div>
    </div>
  );
}
