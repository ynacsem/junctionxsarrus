
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
import { Search, Filter, MapPin, Home, DollarSign, Ruler, Bed, School, Heart, Bus, Plus } from "lucide-react";
import Link from "next/link";
import { useProperties } from "@/hooks/use-api";
import { useProperty } from "@/hooks/use-api";
import { Property } from "@/lib/types";

const propertyTypes = ["apartment", "house", "villa", "studio", "penthouse"];

export default function PropertiesPage() {
  const pathname = usePathname();
  const segments = pathname.replace(/^\/|\/$/g, "").split("/");
  const first = segments[segments.length - 2] || "Dashboard";
  const second = segments[segments.length - 1];

  // Filter states
  const [searchPropertyId, setSearchPropertyId] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchMode, setSearchMode] = useState<"all" | "id">("all");
  const [searchInput, setSearchInput] = useState("");
  const [rawProperties, setRawProperties] = useState<any>(null);

  // API integration
  const { properties, loading, error, fetchProperties } = useProperties();
  const { property: searchedProperty, loading: loadingProperty, error: errorProperty, fetchProperty } = useProperty();

  // Fetch all properties initially or when filters change
  useEffect(() => {
    fetchProperties({
      // limit: 10, // Remove limit to fetch all
      location: undefined,
      property_type: selectedPropertyType || undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      min_area: minArea ? Number(minArea) : undefined,
      max_area: maxArea ? Number(maxArea) : undefined,
    }).then((data) => setRawProperties(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPropertyType, minPrice, maxPrice, minArea, maxArea]);

  // Fetch property by property_id when searching by property_id
  useEffect(() => {
    if (searchPropertyId) {
      setSearchMode("id");
      setSearchError("");
      fetchProperty(searchPropertyId);
    } else {
      setSearchError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchPropertyId]);

  useEffect(() => {
    fetchProperties({ limit: 10 }).then((data) => setRawProperties(data));
  }, []);

  const clearFilters = () => {
    setSearchInput("");
    setSearchPropertyId("");
    setSelectedPropertyType("");
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setMaxArea("");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-purple-100/60 border-b border-purple-200">
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
            <h1 className="text-2xl font-bold">Properties</h1>
            <p className="text-muted-foreground">
              Manage and view all your property listings
            </p>
          </div>
          <Link href="/dashboard/properties/add">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Property
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
                <label className="text-sm font-medium">Property ID</label>
                <Input
                  placeholder="Search by property ID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearchPropertyId(searchInput.trim());
                    }
                  }}
                  className="mt-1"
                />
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
                  <label className="text-sm font-medium">Min Price (DZD)</label>
                  <Input
                    type="number"
                    placeholder="Min price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Price (DZD)</label>
                  <Input
                    type="number"
                    placeholder="Max price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Min Area (m²)</label>
                  <Input
                    type="number"
                    placeholder="Min area"
                    value={minArea}
                    onChange={(e) => setMinArea(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Area (m²)</label>
                  <Input
                    type="number"
                    placeholder="Max area"
                    value={maxArea}
                    onChange={(e) => setMaxArea(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {(searchPropertyId || selectedPropertyType || minPrice || maxPrice || minArea || maxArea) && (
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
            {searchMode === "id" && searchPropertyId
              ? (loadingProperty ? "Searching..." : searchedProperty ? "1 property found" : "0 properties found")
              : loading ? "Searching..." : `${properties.length} propert${properties.length === 1 ? 'y' : 'ies'} found`}
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {searchError ? (
            <Card className="text-center py-12 border-2 border-red-200 bg-red-50">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Home className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">Invalid Property ID</h3>
                    <p className="text-muted-foreground">{searchError}</p>
                  </div>
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : searchMode === "id" && searchPropertyId ? (
            loadingProperty ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <Home className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">Loading property...</h3>
                      <p className="text-muted-foreground">Please wait while we fetch the property data.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : errorProperty ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <Home className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">Error loading property</h3>
                      <p className="text-muted-foreground">{errorProperty}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : searchedProperty ? (
              <Card key={searchedProperty.property_id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{searchedProperty.property_id}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {searchedProperty.location}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(searchedProperty.price_DZD)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {searchedProperty.area} m²
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Property Type and Rooms */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{searchedProperty.property_type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span>{searchedProperty.rooms} rooms</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <School className="h-3 w-3 text-muted-foreground" />
                      <span>{searchedProperty.schools_nearby} schools</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-muted-foreground" />
                      <span>{searchedProperty.hospitals_nearby} hospitals</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Ruler className="h-3 w-3 text-muted-foreground" />
                      <span>{searchedProperty.parks_nearby} parks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bus className="h-3 w-3 text-muted-foreground" />
                      <span>Score: {searchedProperty.public_transport_score}/5</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/dashboard/properties/${searchedProperty.property_id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/dashboard/properties/${searchedProperty.property_id}/edit`}>
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
                    <Home className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">No property found</h3>
                      <p className="text-muted-foreground">No property matches the entered ID.</p>
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
                    <Home className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">Loading properties...</h3>
                      <p className="text-muted-foreground">Please wait while we fetch the property data.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <Home className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">Error loading properties</h3>
                      <p className="text-muted-foreground">Failed to fetch property data. Please try again later.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : properties.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <Home className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">No properties found</h3>
                      <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
                    </div>
                    <Button onClick={clearFilters} variant="outline">
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              properties.map((property: Property) => (
                <Card key={property.property_id} className="overflow-hidden border-2 border-purple-200 bg-white/90 shadow-sm hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{property.property_id}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {property.location}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {formatPrice(property.price_DZD)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {property.area} m²
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Property Type and Rooms */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{property.property_type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4 text-muted-foreground" />
                        <span>{property.rooms} rooms</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <School className="h-3 w-3 text-muted-foreground" />
                        <span>{property.schools_nearby} schools</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-muted-foreground" />
                        <span>{property.hospitals_nearby} hospitals</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Ruler className="h-3 w-3 text-muted-foreground" />
                        <span>{property.parks_nearby} parks</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bus className="h-3 w-3 text-muted-foreground" />
                        <span>Score: {property.public_transport_score}/5</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/dashboard/properties/${property.property_id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/dashboard/properties/${property.property_id}/edit`}>
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
        {rawProperties && (
          <div className="mt-8">
            <h3 className="font-bold mb-2">Raw API Response</h3>
            <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">{JSON.stringify(rawProperties, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
