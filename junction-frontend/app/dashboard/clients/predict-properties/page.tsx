"use client";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Search,
  Home,
  TrendingUp,
  MapPin,
  DollarSign,
  Bed,
  School,
  Heart,
  Bus,
  Target,
  Award,
  BarChart3,
  ArrowRight,
  Sparkles,
  Filter,
  Star,
  Users
} from "lucide-react";
import Link from "next/link";
import { useClient } from "@/hooks/use-api";
import { apiClient } from "@/lib/api";

export default function PredictPropertiesPage() {
  const pathname = usePathname();
  const segments = pathname.replace(/^\/|\/$/g, "").split("/");
  const first = segments[segments.length - 4] || "Dashboard";
  const second = segments[segments.length - 3];
  const third = segments[segments.length - 2];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { client, loading: loadingClient, error: errorClient, fetchClient } = useClient();
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setShowSearchResults(true);
    fetchClient(searchQuery.trim());
  };

  const handleClientSelect = async (client: any) => {
    setSelectedClient(client);
    setShowSearchResults(false);
    setRecommendations(null);
    setIsLoading(true);
    setError(null);
    try {
      const recs = await apiClient.getRecommendationsForClient(client.client_id);
      setRecommendations(recs.recommended_properties);
    } catch (err: any) {
      setError(err.message || "Failed to fetch recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.6) return "bg-green-100 text-green-800";
    if (confidence >= 0.4) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.6) return "High";
    if (confidence >= 0.4) return "Medium";
    return "Low";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  {first.charAt(0).toUpperCase() + first.slice(1)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/clients">
                  {second.charAt(0).toUpperCase() + second.slice(1)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                Predict Properties
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Predict Properties for Client
          </h1>
          <p className="text-muted-foreground">
            Find the best properties for your clients using AI-powered matching
          </p>
        </div>

        {/* Client Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Search Client
            </CardTitle>
            <CardDescription>
              Enter client ID to find matching properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Search by client ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            {/* Search Results */}
            {showSearchResults && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium">Search Results (by client_id)</h3>
                {loadingClient ? (
                  <div className="text-muted-foreground">Searching...</div>
                ) : errorClient ? (
                  <div className="text-destructive">{errorClient}</div>
                ) : client ? (
                  <div
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleClientSelect(client)}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">{client.client_id}</div>
                        <div className="text-sm text-muted-foreground">
                          {client.preferred_location} • {client.preferred_property_type} • {client.marital_status}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(client.min_budget_DZD)} - {formatCurrency(client.max_budget_DZD)}</div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No client found with this ID.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Client */}
        {selectedClient && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Selected Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Client {selectedClient.client_id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedClient.preferred_location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatCurrency(selectedClient.min_budget_DZD)} - {formatCurrency(selectedClient.max_budget_DZD)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedClient.preferred_property_type}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Analyzing client preferences and finding matching properties...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="text-destructive py-8 text-center">{error}</CardContent>
          </Card>
        )}

        {/* Recommendations Results */}
        {recommendations && !isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Client Info */}
            <Card className="overflow-hidden border-2 border-blue-200 bg-white/90 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader><CardTitle>Client Info</CardTitle></CardHeader>
              <CardContent>
                <div>Client ID: {recommendations.client_info?.client_id}</div>
                <div>Location: {recommendations.client_info?.preferred_location}</div>
                <div>Budget: {recommendations.client_info?.budget_range}</div>
                <div>Area: {recommendations.client_info?.area_preference}</div>
                <div>Type: {recommendations.client_info?.property_type}</div>
                <div>Has Kids: {recommendations.client_info?.has_kids ? "Yes" : "No"}</div>
              </CardContent>
            </Card>
            {/* Processing Info */}
            <Card className="overflow-hidden border-2 border-blue-200 bg-white/90 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader><CardTitle>Processing Info</CardTitle></CardHeader>
              <CardContent>
                <div>Initial Houses: {recommendations.processing_info?.initial_houses_count}</div>
              </CardContent>
            </Card>
            {/* Filtering Results */}
            <Card className="overflow-hidden border-2 border-blue-200 bg-white/90 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader><CardTitle>Filtering Results</CardTitle></CardHeader>
              <CardContent>
                <div>Excluded Houses: {recommendations.filtering_results?.excluded_houses}</div>
                <div>Remaining Houses: {recommendations.filtering_results?.remaining_houses}</div>
                <div>Exclusion Reason: {recommendations.filtering_results?.exclusion_reason}</div>
              </CardContent>
            </Card>
            {/* Recommendations */}
            <Card className="overflow-hidden border-2 border-blue-200 bg-white/90 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader><CardTitle>Top Recommendations</CardTitle></CardHeader>
              <CardContent>
                {recommendations.recommendations?.map((rec: any, idx: number) => (
                  <div key={rec.house_index || idx} className="mb-4 p-2 border rounded">
                    <div className="font-bold">Property {rec.house_index}</div>
                    <div>Location: {rec.location}</div>
                    <div>Price: {formatCurrency(rec.price)}</div>
                    <div>Area: {rec.area} m²</div>
                    <div>Type: {rec.type}</div>
                    <div>Distance: {rec.distance_km} km</div>
                    <div>Confidence (Model): {(rec.confidence_model * 100).toFixed(1)}%</div>
                    <div>Confidence (Distance): {(rec.confidence_distance * 100).toFixed(1)}%</div>
                    <div>Overall Confidence: {(rec.confidence * 100).toFixed(1)}%</div>
                    <div>
                      <strong>Explanations:</strong>
                      <ul>
                        {rec.explanations?.map((ex: string, i: number) => <li key={i}>{ex}</li>)}
                      </ul>
                    </div>
                    <div className="mt-2">
                      <Link href={`/dashboard/properties/${rec.property_id || rec.house_index}`}>
                        <Button variant="outline" size="sm">
                          View Property Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* Profit Analysis */}
            {recommendations.profit_analysis && recommendations.profit_analysis.length > 0 && (
              <Card className="overflow-hidden border-2 border-blue-200 bg-white/90 shadow-sm hover:shadow-lg transition-shadow">
                <CardHeader><CardTitle>Profit Analysis</CardTitle></CardHeader>
                <CardContent>
                  {recommendations.profit_analysis.map((pa: any, idx: number) => (
                    <div key={idx} className="mb-4 p-2 border rounded">
                      <div>Location: {pa.location}</div>
                      <div>Potential Margin: {formatCurrency(pa.potential_margin_DZD)} ({pa.potential_margin_percent}%)</div>
                      <div>Commission Profit: {formatCurrency(pa.commission_profit_DZD)}</div>
                      <div>Confidence: {(pa.confidence * 100).toFixed(1)}%</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {/* Summary */}
            {recommendations.summary && (
              <Card className="overflow-hidden border-2 border-blue-200 bg-white/90 shadow-sm hover:shadow-lg transition-shadow">
                <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                <CardContent>
                  <div>Total Recommendations: {recommendations.summary.total_recommendations}</div>
                  <div>Top Confidence: {(recommendations.summary.top_confidence * 100).toFixed(1)}%</div>
                  <div>Best Profit Margin: {recommendations.summary.best_profit_margin}%</div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
