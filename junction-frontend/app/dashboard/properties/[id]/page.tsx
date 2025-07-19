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
import { usePathname, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  MapPin,
  Home,
  DollarSign,
  Ruler,
  Bed,
  School,
  Heart,
  Bus,
  Edit,
  Trash2,
  ArrowLeft,
  Star,
  Calendar,
  Phone,
  Mail,
  Share2
} from "lucide-react";
import Link from "next/link";
import { useProperty, useProperties, usePropertyRecommendations } from "@/hooks/use-api";
import { useRouter } from "next/navigation";
import { Recommendation } from "@/lib/types";

export default function PropertyDetailsPage() {
  const pathname = usePathname();
  const params = useParams();
  const segments = pathname.replace(/^\/|\/$/g, "").split("/");
  const first = segments[segments.length - 3] || "Dashboard";
  const second = segments[segments.length - 2];
  const propertyId = params.id as string;

  const { property, loading, error, fetchProperty } = useProperty();
  const { deleteProperty, loading: deleting, error: deleteError } = useProperties();
  const { recommendations, loading: loadingRecommendations, error: recommendationsError, fetchRecommendations } = usePropertyRecommendations();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // Remove showRecommendations state
  // const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    if (propertyId) {
      fetchProperty(propertyId); // Use the string property_id
    }
  }, [propertyId, fetchProperty]);

  useEffect(() => {
    if (propertyId) {
      fetchRecommendations(propertyId);
    }
  }, [propertyId, fetchRecommendations]);

  const handleDelete = async () => {
    try {
      await deleteProperty(propertyId);
      router.push("/dashboard/properties");
    } catch (e) {
      // error handled by hook
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTransportScoreColor = (score: number) => {
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.6) return "text-green-600";
    if (confidence >= 0.4) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.6) return "High Match";
    if (confidence >= 0.4) return "Medium Match";
    return "Low Match";
  };

  if (loading) {
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
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error loading property</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/dashboard/properties">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
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
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 items-center justify-between">
          <div className="text-center">
            <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The property you're looking for doesn't exist.
            </p>
            <Link href="/dashboard/properties">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Defensive: always use an array for recommendations
  let recsArray: any[] = [];
  if (Array.isArray(recommendations)) {
    recsArray = recommendations;
  } else if (recommendations && Array.isArray((recommendations as any).matches)) {
    recsArray = (recommendations as any).matches;
  }

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
                {property.property_id}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header with back button and actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/properties">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{property.property_id}</h1>
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {property.location}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Link href={`/dashboard/properties/${property.property_id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        {/* Replace the grid for main content and sidebar with a responsive flex layout */}
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Main Property Information (2/3 width on desktop) */}
          <div className="flex-1 space-y-6">
            {/* Price and Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-3xl font-bold text-primary mb-2">
                      {formatPrice(property.price_DZD)}
                    </h3>
                    <p className="text-muted-foreground">Total Price</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Property Type</span>
                      <span className="font-medium capitalize">{property.property_type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Area</span>
                      <span className="font-medium">{property.area} m²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rooms</span>
                      <span className="font-medium">{property.rooms}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities and Nearby Facilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Nearby Amenities
                </CardTitle>
                <CardDescription>
                  Information about nearby facilities and amenities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <School className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Schools Nearby</span>
                      </div>
                      <span className="font-bold">{property.schools_nearby}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">Hospitals Nearby</span>
                      </div>
                      <span className="font-bold">{property.hospitals_nearby}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Parks Nearby</span>
                      </div>
                      <span className="font-bold">{property.parks_nearby}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Public Transport</span>
                      </div>
                      <span className={`font-bold ${getTransportScoreColor(property.public_transport_score ?? 0)}`}>
                        {(property.public_transport_score ?? 0)}/5
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  Property Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.rooms} Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.area} m² Living Area</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Located in {property.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatPrice(property.price_DZD)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Recommendations */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      Client Recommendations
                    </CardTitle>
                    <CardDescription>
                      AI-powered client matches for this property
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingRecommendations ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Analyzing client matches...</p>
                  </div>
                ) : recommendationsError ? (
                  <div className="text-center py-8">
                    <p className="text-destructive">{recommendationsError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchRecommendations(propertyId)}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                ) : recsArray.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No client recommendations found.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
                    {recsArray.map((rec: any, idx: number) => (
                      <Card key={rec.client_id || idx} className="border-2 border-blue-200 bg-white/90 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg">Client {rec.client_id}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            Preferred Location: {rec.preferred_location}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm">Distance: {rec.distance_km} km</div>
                          <div className="text-sm">Budget Range: {rec.buyer_details?.budget_range}</div>
                          <div className="text-sm">Area Range: {rec.buyer_details?.area_range}</div>
                          <div className="text-sm">Property Type: {rec.buyer_details?.property_type}</div>
                          <div className="text-sm">Marital Status: {rec.buyer_details?.marital_status}</div>
                          <div className="text-sm">Has Kids: {rec.buyer_details?.has_kids ? "Yes" : "No"}</div>
                          <div className="text-sm">Price: {rec.price ? formatPrice(rec.price) : "N/A"}</div>
                          <div className="text-sm">Confidence (Model): {rec.confidence_model !== undefined ? (rec.confidence_model * 100).toFixed(1) : "N/A"}%</div>
                          <div className="text-sm">Confidence (Distance): {rec.confidence_distance !== undefined ? (rec.confidence_distance * 100).toFixed(1) : "N/A"}%</div>
                          <div className="text-sm">Overall Confidence: {rec.confidence !== undefined ? (rec.confidence * 100).toFixed(1) : "N/A"}%</div>
                          <div className="text-sm">
                            <strong>Explanations:</strong>
                            <ul className="list-disc ml-5">
                              {rec.explanations?.map((ex: string, i: number) => <li key={i}>{ex}</li>)}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>


          </div>
          {/* Sidebar (1/3 width on desktop) */}
          <div className="w-full lg:w-1/3 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Agent</p>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Real Estate Agent</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">+213 123 456 789</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">sarah.j@realestate.dz</p>
                </div>
                <Button className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Agent
                </Button>
              </CardContent>
            </Card>

            {/* Property Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Property Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                    Available
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Listed Date</span>
                  <span className="text-sm font-medium">Jan 15, 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Views</span>
                  <span className="text-sm font-medium">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Favorites</span>
                  <span className="text-sm font-medium">56</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/dashboard/properties/${property.property_id}/edit`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Property
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Property
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Viewing
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? "Deleting..." : "Delete Property"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-lg font-bold mb-2">Delete Property</h2>
            <p className="mb-4">Are you sure you want to delete this property? This action cannot be undone.</p>
            {deleteError && <p className="text-red-500 mb-2">{deleteError}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

