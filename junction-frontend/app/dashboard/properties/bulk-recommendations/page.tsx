"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { Input } from "@/components/ui/input";

export default function BulkRecommendationsPage() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleBulkRecommend = async () => {
        setLoading(true);
        setError(null);
        setResults(null);
        try {
            const recs = await apiClient.getAllPropertiesRecommendations();
            setResults(recs);
        } catch (err: any) {
            setError(err.message || "Failed to get recommendations");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 p-8">
            <h1 className="text-2xl font-bold mb-4">Bulk Property Recommendations</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Bulk Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleBulkRecommend} disabled={loading}>
                        Recommend for All Properties
                    </Button>
                </CardContent>
            </Card>
            {loading && <div>Loading recommendations...</div>}
            {error && <div className="text-destructive">{error}</div>}
            {results && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recommendations Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">{JSON.stringify(results, null, 2)}</pre>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 