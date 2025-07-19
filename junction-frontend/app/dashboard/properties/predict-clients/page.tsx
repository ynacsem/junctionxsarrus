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
  Users,
  TrendingUp,
  MapPin,
  DollarSign,
  Home,
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
  Star
} from "lucide-react";
import Link from "next/link";
import { useProperty } from "@/hooks/use-api";
import { apiClient } from "@/lib/api";

type RecommendationApiResponse = {
  recommendations?: any[];
  matches?: any[];
  summary?: any;
  house_info?: any;
  processing_info?: any;
  filtering_results?: any;
  profit_analysis?: any[];
};

export default function PredictClientsPage() {
  const pathname = usePathname();
  const segments = pathname.replace(/^\/|\/$/g, "").split("/");
  const first = segments[segments.length - 4] || "Dashboard";
  const second = segments[segments.length - 3];
  const third = segments[segments.length - 2];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { property, loading: loadingProperty, error: errorProperty, fetchProperty } = useProperty();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [profitSummary, setProfitSummary] = useState<any>(null);
  const [apiResponse, setApiResponse] = useState<RecommendationApiResponse | null>(null);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setShowSearchResults(true);
    fetchProperty(searchQuery.trim());
  };

  const handlePropertySelect = async (property: any) => {
    setSelectedProperty(property);
    setShowSearchResults(false);
    setRecommendations([]);
    setProfitSummary(null);
    setApiResponse(null);
    setIsLoading(true);
    try {
      const recs = await apiClient.getRecommendationsForProperty(property.property_id) as RecommendationApiResponse | any[];
      setApiResponse(recs as RecommendationApiResponse);
      if (Array.isArray(recs)) {
        setRecommendations(recs);
      } else if (recs && Array.isArray(recs.recommendations)) {
        setRecommendations(recs.recommendations);
        if (recs.summary) setProfitSummary(recs.summary);
      } else if (recs && Array.isArray(recs.matches)) {
        setRecommendations(recs.matches);
        if (recs.summary) setProfitSummary(recs.summary);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      setRecommendations([]);
      setProfitSummary(null);
      setApiResponse(null);
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
    if (confidence >= 0.4) return "bg-green-100 text-green-800";
    if (confidence >= 0.3) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.4) return "High";
    if (confidence >= 0.3) return "Medium";
    return "Low";
  };

  return (
    <div className="flex flex-col">
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
                <BreadcrumbLink href="/dashboard/properties">
                  {second.charAt(0).toUpperCase() + second.slice(1)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                Predict Clients
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
            Predict Potential Clients
          </h1>
          <p className="text-muted-foreground">
            Find the best clients for your properties using AI-powered matching
          </p>
        </div>

        {/* Property Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search Property
            </CardTitle>
            <CardDescription>
              Enter property details to find potential buyers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Search by property ID..."
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
                <h3 className="font-medium">Search Results (by property_id)</h3>
                {loadingProperty ? (
                  <div className="text-muted-foreground">Searching...</div>
                ) : errorProperty ? (
                  <div className="text-destructive">{errorProperty}</div>
                ) : property ? (
                  <div
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handlePropertySelect(property)}
                  >
                    <div className="flex items-center gap-3">
                      <Home className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">{property.location}</div>
                        <div className="text-sm text-muted-foreground">
                          {property.property_type} • {property.rooms} rooms • {property.area}m²
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(property.price_DZD)}</div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No property found with this ID.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Property */}
        {selectedProperty && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Selected Property
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedProperty.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatCurrency(selectedProperty.price_DZD)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedProperty.property_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedProperty.rooms} rooms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {selectedProperty && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Recommended Clients
              </CardTitle>
              <CardDescription>
                AI-powered client matches for this property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Finding best client matches...</p>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No client recommendations found for this property.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.isArray(recommendations) && recommendations.slice(0, 5).map((rec, idx) => (
                    <div key={rec.client_id || idx} className="p-4 border rounded-lg mb-4">
                      <div className="font-bold">Client {rec.client_id}</div>
                      <div>Preferred Location: {rec.preferred_location}</div>
                      <div>Distance: {rec.distance_km} km</div>
                      <div>Budget Range: {rec.buyer_details?.budget_range}</div>
                      <div>Area Range: {rec.buyer_details?.area_range}</div>
                      <div>Property Type: {rec.buyer_details?.property_type}</div>
                      <div>Marital Status: {rec.buyer_details?.marital_status}</div>
                      <div>Has Kids: {rec.buyer_details?.has_kids ? "Yes" : "No"}</div>
                      <div>Price: {rec.price ? formatCurrency(rec.price) : "N/A"}</div>
                      <div>Confidence (Model): {rec.confidence_model !== undefined ? (rec.confidence_model * 100).toFixed(1) : "N/A"}%</div>
                      <div>Confidence (Distance): {rec.confidence_distance !== undefined ? (rec.confidence_distance * 100).toFixed(1) : "N/A"}%</div>
                      <div>Overall Confidence: {rec.confidence !== undefined ? (rec.confidence * 100).toFixed(1) : "N/A"}%</div>
                      <div>
                        <strong>Explanations:</strong>
                        <ul>
                          {Array.isArray(rec.explanations) && rec.explanations.length > 0
                            ? rec.explanations.map((ex: string, i: number) => <li key={i}>{ex}</li>)
                            : <li>No explanations available.</li>
                          }
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Profit Analysis */}
              {profitSummary && (
                <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" /> Profit Analysis
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Matches:</span>
                      <div className="font-bold">{profitSummary.total_matches}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Top Confidence:</span>
                      <div className="font-bold">{(profitSummary.top_confidence * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Best Profit Margin:</span>
                      <div className="font-bold">{profitSummary.best_profit_margin}%</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Analyzing property and finding potential clients...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {apiResponse && (
          <div className="space-y-6 mt-6">
            {/* House Info */}
            <Card>
              <CardHeader>
                <CardTitle>Property Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div>Location: {apiResponse.house_info?.location}</div>
                <div>Price: {formatCurrency(apiResponse.house_info?.price_DZD)}</div>
                <div>Area: {apiResponse.house_info?.area} m²</div>
                <div>Type: {apiResponse.house_info?.property_type}</div>
                <div>Rooms: {apiResponse.house_info?.rooms}</div>
                <div>Schools Nearby: {apiResponse.house_info?.schools_nearby}</div>
                <div>Hospitals Nearby: {apiResponse.house_info?.hospitals_nearby}</div>
                <div>Parks Nearby: {apiResponse.house_info?.parks_nearby}</div>
                <div>Public Transport Score: {apiResponse.house_info?.public_transport_score}</div>
                <div className="mt-4">
                  <Link href={`/dashboard/properties/${selectedProperty?.property_id}`}>
                    <Button variant="outline" size="sm">
                      View Property Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            {/* Processing Info */}
            <Card>
              <CardHeader>
                <CardTitle>Processing Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div>Initial Buyers: {apiResponse.processing_info?.initial_buyers_count}</div>
                <div>House Price: {formatCurrency(apiResponse.processing_info?.house_price)}</div>
              </CardContent>
            </Card>
            {/* Filtering Results */}
            <Card>
              <CardHeader>
                <CardTitle>Filtering Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div>Excluded Buyers: {apiResponse.filtering_results?.excluded_buyers}</div>
                <div>Remaining Buyers: {apiResponse.filtering_results?.remaining_buyers}</div>
                <div>Exclusion Reason: {apiResponse.filtering_results?.exclusion_reason}</div>
              </CardContent>
            </Card>
            {/* Profit Analysis */}
            {apiResponse.profit_analysis && apiResponse.profit_analysis.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Profit Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  {apiResponse.profit_analysis.map((pa: any, idx: number) => (
                    <div key={idx} className="mb-4 p-2 border rounded">
                      <div>Client: {pa.client_id}</div>
                      <div>Potential Margin: {formatCurrency(pa.potential_margin_DZD)} ({pa.potential_margin_percent}%)</div>
                      <div>Commission Profit: {formatCurrency(pa.commission_profit_DZD)}</div>
                      <div>Confidence: {(pa.confidence * 100).toFixed(1)}%</div>
                      <div className="mt-2">
                        <Link href={`/dashboard/clients/${pa.client_id}`}>
                          <Button variant="outline" size="sm">
                            View Client Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {/* Summary */}
            {apiResponse.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>Total Matches: {apiResponse.summary.total_matches}</div>
                  <div>Top Confidence: {(apiResponse.summary.top_confidence * 100).toFixed(1)}%</div>
                  <div>Best Profit Margin: {apiResponse.summary.best_profit_margin}%</div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

