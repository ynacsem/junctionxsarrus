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
  User,
  DollarSign,
  Home,
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
  Share2,
  Baby,
  Heart as HeartIcon,
  Ruler,
  Target,
  Users
} from "lucide-react";
import Link from "next/link";
import { useClient } from "@/hooks/use-api";
import { useClients } from "@/hooks/use-api";
import { useRouter } from "next/navigation";

export default function ClientDetailsPage() {
  const pathname = usePathname();
  const params = useParams();
  const segments = pathname.replace(/^\/|\/$/g, "").split("/");
  const first = segments[segments.length - 3] || "Dashboard";
  const second = segments[segments.length - 2];
  const clientId = params.id as string;

  // API integration
  const { client, loading, error, fetchClient } = useClient();
  const { deleteClient, loading: deleting, error: deleteError } = useClients();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClient(clientId); // pass as string
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

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

  const getWeightLabel = (weight: number) => {
    if (weight >= 0.6) return "High Priority";
    if (weight >= 0.4) return "Medium Priority";
    return "Low Priority";
  };

  const handleDelete = async () => {
    try {
      await deleteClient(Number(clientId), true); // permanent delete
      router.push("/dashboard/clients");
    } catch (e) {
      // error handled by hook
    }
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
            <p className="text-muted-foreground">Loading client details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4 animate-spin"></div>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Client not found.</p>
        </div>
      </div>
    );
  }

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
                <BreadcrumbLink href="/dashboard/clients">
                  {second.charAt(0).toUpperCase() + second.slice(1)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                {client.client_id}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header with back button and actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/clients">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Clients
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{client.client_id}</h1>
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {client.preferred_location}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Link href={`/dashboard/clients/${client.client_id}/edit`}>
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Client Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Budget and Basic Info */}
            <Card className="border-2 border-blue-200 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Budget & Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-2xl font-bold text-primary mb-2">
                      {formatPrice(client.min_budget_DZD)} - {formatPrice(client.max_budget_DZD)}
                    </h3>
                    <p className="text-muted-foreground">Budget Range</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Property Type</span>
                      <span className="font-medium capitalize">{client.preferred_property_type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Area Range</span>
                      <span className="font-medium">{client.min_area} - {client.max_area} m²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Preferred Rooms</span>
                      <span className="font-medium">{client.preferred_rooms}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="border-2 border-blue-200 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Marital Status</span>
                      </div>
                      <span className="font-bold capitalize">{client.marital_status}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {client.has_kids ? (
                          <Baby className="h-4 w-4 text-green-600" />
                        ) : (
                          <HeartIcon className="h-4 w-4 text-purple-600" />
                        )}
                        <span className="text-sm font-medium">Children</span>
                      </div>
                      <span className="font-bold">{client.has_kids ? "Has Kids" : "No Kids"}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">Preferred Location</span>
                      </div>
                      <span className="font-bold">{client.preferred_location}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm font-medium">Property Type</span>
                      </div>
                      <span className="font-bold capitalize">{client.preferred_property_type}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences Weights */}
            <Card className="border-2 border-blue-200 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Preference Weights
                </CardTitle>
                <CardDescription>
                  How important each factor is to this client (0-100%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Location</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${getWeightColor(client.weight_location ?? 0)}`}>
                          {((client.weight_location ?? 0) * 100).toFixed(0)}%
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {getWeightLabel(client.weight_location ?? 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Property Type</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${getWeightColor(client.weight_property_type ?? 0)}`}>
                          {((client.weight_property_type ?? 0) * 100).toFixed(0)}%
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {getWeightLabel(client.weight_property_type ?? 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Number of Rooms</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${getWeightColor(client.weight_rooms ?? 0)}`}>
                          {((client.weight_rooms ?? 0) * 100).toFixed(0)}%
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {getWeightLabel(client.weight_rooms ?? 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <School className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">Schools Nearby</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${getWeightColor(client.weight_schools_nearby ?? 0)}`}>
                          {((client.weight_schools_nearby ?? 0) * 100).toFixed(0)}%
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {getWeightLabel(client.weight_schools_nearby ?? 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">Hospitals Nearby</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${getWeightColor(client.weight_hospitals_nearby ?? 0)}`}>
                          {((client.weight_hospitals_nearby ?? 0) * 100).toFixed(0)}%
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {getWeightLabel(client.weight_hospitals_nearby ?? 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm font-medium">Public Transport</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${getWeightColor(client.weight_public_transport_score ?? 0)}`}>
                          {((client.weight_public_transport_score ?? 0) * 100).toFixed(0)}%
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {getWeightLabel(client.weight_public_transport_score ?? 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="border-2 border-blue-100 bg-white/90 shadow-sm">
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
                  Contact Client
                </Button>
              </CardContent>
            </Card>

            {/* Client Status */}
            <Card className="border-2 border-blue-100 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Client Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Registered Date</span>
                  <span className="text-sm font-medium">Jan 15, 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Properties Viewed</span>
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Favorites</span>
                  <span className="text-sm font-medium">5</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-2 border-blue-100 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/dashboard/clients/${client.client_id}/edit`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Client
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start text-destructive" onClick={() => setDeleteDialogOpen(true)} disabled={deleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? "Deleting..." : "Delete Client"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-lg font-bold mb-2">Delete Client</h2>
            <p className="mb-4">Are you sure you want to delete this client? This action cannot be undone.</p>
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
