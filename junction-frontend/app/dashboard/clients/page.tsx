
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
import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Users, DollarSign, Home, Bed, School, Heart, Bus, Plus, User, Baby, Heart as HeartIcon, Ruler } from "lucide-react";
import Link from "next/link";
import { useClients } from "@/hooks/use-api";
import { useClient } from "@/hooks/use-api";
import { Client } from "@/lib/types";

export default function ClientsPage() {
  const pathname = usePathname();
  const segments = pathname.replace(/^\/|\/$/g, "").split("/");
  const first = segments[segments.length - 2] || "Dashboard";
  const second = segments[segments.length - 1];

  // Filter states
  const [searchClientId, setSearchClientId] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState("");
  const [hasKids, setHasKids] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [rawClients, setRawClients] = useState<any>(null);

  // API integration
  const {
    clients,
    loading,
    error,
    fetchClients
  } = useClients();
  const { client: searchedClient, loading: loadingClient, error: errorClient, fetchClient } = useClient();
  const [searchMode, setSearchMode] = useState<"all" | "id">("all");

  const propertyTypes = ["apartment", "house", "villa", "studio", "duplex", "penthouse"];
  const maritalStatuses = ["single", "married", "divorced", "widowed"];

  // Fetch all clients initially or when filters change and no client ID is searched
  useEffect(() => {
    if (!searchClientId) {
      setSearchMode("all");
      fetchClients({
        // limit: 10, // Remove limit to fetch all
        property_type: selectedPropertyType || undefined,
        min_budget: minBudget ? Number(minBudget) : undefined,
        max_budget: maxBudget ? Number(maxBudget) : undefined,
        marital_status: selectedMaritalStatus || undefined,
        has_kids: hasKids !== "" ? hasKids === "true" : undefined,
      }).then((data) => setRawClients(data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchClientId, selectedPropertyType, minBudget, maxBudget, selectedMaritalStatus, hasKids]);

  // Fetch client by client_id when searching
  useEffect(() => {
    if (searchClientId) {
      setSearchMode("id");
      setSearchError("");
      fetchClient(searchClientId); // always pass client_id as string
    } else {
      setSearchError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchClientId]);

  const clearFilters = () => {
    setSearchInput("");
    setSearchClientId("");
    setSelectedPropertyType("");
    setMinBudget("");
    setMaxBudget("");
    setSelectedMaritalStatus("");
    setHasKids("");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getWeightColor = (weight: number) => {
    if (weight >= 0.6) return "text-green-600";
    if (weight >= 0.4) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-blue-100/60 border-b border-blue-200">
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
                {second.charAt(0).toUpperCase() + second.slice(1)}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header with search and add button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Clients</h1>
            <p className="text-muted-foreground">
              Manage and view all your client profiles
            </p>
          </div>
          <Link href="/dashboard/clients/add">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search & Filters
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Client ID</label>
                <div className="flex">
                  <Input
                    placeholder="Search by ID..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearchClientId(searchInput.trim());
                      }
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="w-48">
                <label className="text-sm font-medium">Property Type</label>
                <select
                  value={selectedPropertyType}
                  onChange={(e) => setSelectedPropertyType(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">All Types</option>
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-sm font-medium">Min Budget (DZD)</label>
                  <Input
                    type="number"
                    placeholder="Min budget"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Budget (DZD)</label>
                  <Input
                    type="number"
                    placeholder="Max budget"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Marital Status</label>
                  <select
                    value={selectedMaritalStatus}
                    onChange={(e) => setSelectedMaritalStatus(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="">All Statuses</option>
                    {maritalStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Has Kids</label>
                  <select
                    value={hasKids}
                    onChange={(e) => setHasKids(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {(searchClientId || selectedPropertyType || minBudget || maxBudget || selectedMaritalStatus || hasKids) && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {searchMode === "id" && searchClientId
              ? (loadingClient ? "Searching..." : searchedClient ? "1 client found" : "0 clients found")
              : loading ? "Searching..." : `${clients.length} client${clients.length === 1 ? '' : 's'} found`}
          </p>
        </div>

        {/* Clients Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {searchError ? (
            <Card className="text-center py-12 border-2 border-red-200 bg-red-50">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Users className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">Invalid ID</h3>
                    <p className="text-muted-foreground">{searchError}</p>
                  </div>
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : searchMode === "id" && searchClientId ? (
            loadingClient ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <Users className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">Loading client...</h3>
                      <p className="text-muted-foreground">Please wait while we fetch the client data.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : errorClient ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <Users className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">Error loading client</h3>
                      <p className="text-muted-foreground">{errorClient}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : searchedClient ? (
              <Card key={searchedClient.client_id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{searchedClient.client_id}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {searchedClient.preferred_location}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary">
                        {formatPrice(searchedClient.min_budget_DZD)} - {formatPrice(searchedClient.max_budget_DZD)}
                      </div>
                      <div className="text-xs text-muted-foreground">Budget Range</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Basic Info */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{searchedClient.preferred_property_type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span>{searchedClient.preferred_rooms} rooms</span>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{searchedClient.marital_status}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {searchedClient.has_kids ? (
                        <Baby className="h-4 w-4 text-blue-600" />
                      ) : (
                        <HeartIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{searchedClient.has_kids ? "Has Kids" : "No Kids"}</span>
                    </div>
                  </div>

                  {/* Area Range */}
                  <div className="text-sm">
                    <div className="flex items-center gap-1 mb-1">
                      <Ruler className="h-3 w-3 text-muted-foreground" />
                      <span>Area: {searchedClient.min_area} - {searchedClient.max_area} m²</span>
                    </div>
                  </div>

                  {/* Preferences Weights */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <School className="h-3 w-3 text-muted-foreground" />
                      <span>Schools: {searchedClient.preferred_schools_nearby}</span>
                      <span className={`ml-auto font-medium ${getWeightColor(searchedClient.weight_schools_nearby ?? 0)}`}>
                        {((searchedClient.weight_schools_nearby ?? 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-muted-foreground" />
                      <span>Hospitals: {searchedClient.preferred_hospitals_nearby}</span>
                      <span className={`ml-auto font-medium ${getWeightColor(searchedClient.weight_hospitals_nearby ?? 0)}`}>
                        {((searchedClient.weight_hospitals_nearby ?? 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Ruler className="h-3 w-3 text-muted-foreground" />
                      <span>Parks: {searchedClient.preferred_parks_nearby}</span>
                      <span className={`ml-auto font-medium ${getWeightColor(searchedClient.weight_parks_nearby ?? 0)}`}>
                        {((searchedClient.weight_parks_nearby ?? 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bus className="h-3 w-3 text-muted-foreground" />
                      <span>Transport: {searchedClient.preferred_public_transport_score}/10</span>
                      <span className={`ml-auto font-medium ${getWeightColor(searchedClient.weight_public_transport_score ?? 0)}`}>
                        {((searchedClient.weight_public_transport_score ?? 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/dashboard/clients/${searchedClient.client_id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/dashboard/clients/${searchedClient.client_id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <Users className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">No client found</h3>
                      <p className="text-muted-foreground">No client matches the entered ID.</p>
                    </div>
                    <Button onClick={clearFilters} variant="outline">
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
            loading ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <Users className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">Loading clients...</h3>
                      <p className="text-muted-foreground">Please wait while we fetch the client data.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <Users className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">Error loading clients</h3>
                      <p className="text-muted-foreground">Failed to fetch client data. Please try again later.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : clients.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <Users className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">No clients found</h3>
                      <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
                    </div>
                    <Button onClick={clearFilters} variant="outline">
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              clients.map((client: Client) => (
                <Card key={client.client_id} className="overflow-hidden border-2 border-blue-200 bg-white/90 shadow-sm hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{client.client_id}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {client.preferred_location}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-primary">
                          {formatPrice(client.min_budget_DZD)} - {formatPrice(client.max_budget_DZD)}
                        </div>
                        <div className="text-xs text-muted-foreground">Budget Range</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Basic Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{client.preferred_property_type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4 text-muted-foreground" />
                        <span>{client.preferred_rooms} rooms</span>
                      </div>
                    </div>

                    {/* Personal Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{client.marital_status}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {client.has_kids ? (
                          <Baby className="h-4 w-4 text-blue-600" />
                        ) : (
                          <HeartIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{client.has_kids ? "Has Kids" : "No Kids"}</span>
                      </div>
                    </div>

                    {/* Area Range */}
                    <div className="text-sm">
                      <div className="flex items-center gap-1 mb-1">
                        <Ruler className="h-3 w-3 text-muted-foreground" />
                        <span>Area: {client.min_area} - {client.max_area} m²</span>
                      </div>
                    </div>

                    {/* Preferences Weights */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <School className="h-3 w-3 text-muted-foreground" />
                        <span>Schools: {client.preferred_schools_nearby}</span>
                        <span className={`ml-auto font-medium ${getWeightColor(client.weight_schools_nearby ?? 0)}`}>
                          {((client.weight_schools_nearby ?? 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-muted-foreground" />
                        <span>Hospitals: {client.preferred_hospitals_nearby}</span>
                        <span className={`ml-auto font-medium ${getWeightColor(client.weight_hospitals_nearby ?? 0)}`}>
                          {((client.weight_hospitals_nearby ?? 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Ruler className="h-3 w-3 text-muted-foreground" />
                        <span>Parks: {client.preferred_parks_nearby}</span>
                        <span className={`ml-auto font-medium ${getWeightColor(client.weight_parks_nearby ?? 0)}`}>
                          {((client.weight_parks_nearby ?? 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bus className="h-3 w-3 text-muted-foreground" />
                        <span>Transport: {client.preferred_public_transport_score}/10</span>
                        <span className={`ml-auto font-medium ${getWeightColor(client.weight_public_transport_score ?? 0)}`}>
                          {((client.weight_public_transport_score ?? 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/dashboard/clients/${client.client_id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/dashboard/clients/${client.client_id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          )}
        </div>
        {rawClients && (
          <div className="mt-8">
            <h3 className="font-bold mb-2">Raw API Response</h3>
            <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">{JSON.stringify(rawClients, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
