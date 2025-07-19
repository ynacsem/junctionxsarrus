"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { ArrowBigUpDash } from "lucide-react";

export default function ComparePropertiesPage() {
    const [propertyId1, setPropertyId1] = useState("");
    const [propertyId2, setPropertyId2] = useState("");
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCompare = async () => {
        setLoading(true);
        setError(null);
        setPdfUrl(null);
        try {
            const res = await apiClient.comparePropertiesById(propertyId1, propertyId2);
            const url = URL.createObjectURL(res);
            setPdfUrl(url);
        } catch (err: any) {
            setError(err.message || "Failed to compare properties.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowBigUpDash className="h-5 w-5 text-primary" />
                        Compare Properties
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input
                            placeholder="Enter first property ID"
                            value={propertyId1}
                            onChange={e => setPropertyId1(e.target.value)}
                        />
                        <Input
                            placeholder="Enter second property ID"
                            value={propertyId2}
                            onChange={e => setPropertyId2(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleCompare} disabled={loading || !propertyId1 || !propertyId2}>
                        {loading ? "Comparing..." : "Compare"}
                    </Button>
                    {error && <div className="text-destructive mt-4">{error}</div>}
                    {pdfUrl && (
                        <div className="mt-6">
                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="underline text-primary">
                                Download Comparison PDF
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 