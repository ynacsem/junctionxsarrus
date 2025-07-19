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
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Home,
  MapPin,
  DollarSign,
  Ruler,
  Bed,
  School,
  Heart,
  Bus,
  Edit
} from "lucide-react";
import Link from "next/link";
import { useProperty, useProperties } from "@/hooks/use-api";
import { useRouter } from "next/navigation";

const propertyTypes = ["apartment", "house", "villa", "studio", "penthouse"];

export default function EditPropertyPage() {
  const pathname = usePathname();
  const params = useParams();
  const segments = pathname.replace(/^\/|\/$/g, "").split("/");
  const first = segments[segments.length - 4] || "Dashboard";
  const second = segments[segments.length - 3];
  const propertyId = params.id as string;

  // Form state
  const [formData, setFormData] = useState({
    property_id: "",
    location: "",
    price_DZD: "",
    area: "",
    property_type: "",
    rooms: "",
    schools_nearby: "",
    hospitals_nearby: "",
    parks_nearby: "",
    public_transport_score: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { property, loading, error, fetchProperty } = useProperty();
  const { updateProperty, loading: updating, error: updateError } = useProperties();
  const router = useRouter();

  // Load property data from backend
  useEffect(() => {
    if (propertyId) {
      fetchProperty(propertyId);
    }
  }, [propertyId, fetchProperty]);

  // Populate form when property is loaded
  useEffect(() => {
    if (property) {
      setFormData({
        property_id: property.property_id,
        location: property.location,
        price_DZD: property.price_DZD.toString(),
        area: property.area.toString(),
        property_type: property.property_type,
        rooms: property.rooms.toString(),
        schools_nearby: property.schools_nearby?.toString() || "",
        hospitals_nearby: property.hospitals_nearby?.toString() || "",
        parks_nearby: property.parks_nearby?.toString() || "",
        public_transport_score: property.public_transport_score?.toString() || "",
      });
    }
  }, [property]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.property_id.trim()) {
      newErrors.property_id = "Property ID is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.price_DZD.trim()) {
      newErrors.price_DZD = "Price is required";
    } else if (isNaN(Number(formData.price_DZD)) || Number(formData.price_DZD) <= 0) {
      newErrors.price_DZD = "Price must be a positive number";
    }

    if (!formData.area.trim()) {
      newErrors.area = "Area is required";
    } else if (isNaN(Number(formData.area)) || Number(formData.area) <= 0) {
      newErrors.area = "Area must be a positive number";
    }

    if (!formData.property_type) {
      newErrors.property_type = "Property type is required";
    }

    if (!formData.rooms.trim()) {
      newErrors.rooms = "Number of rooms is required";
    } else if (isNaN(Number(formData.rooms)) || Number(formData.rooms) <= 0) {
      newErrors.rooms = "Number of rooms must be a positive number";
    }

    if (!formData.schools_nearby.trim()) {
      newErrors.schools_nearby = "Number of schools nearby is required";
    } else if (isNaN(Number(formData.schools_nearby)) || Number(formData.schools_nearby) < 0) {
      newErrors.schools_nearby = "Number of schools must be 0 or greater";
    }

    if (!formData.hospitals_nearby.trim()) {
      newErrors.hospitals_nearby = "Number of hospitals nearby is required";
    } else if (isNaN(Number(formData.hospitals_nearby)) || Number(formData.hospitals_nearby) < 0) {
      newErrors.hospitals_nearby = "Number of hospitals must be 0 or greater";
    }

    if (!formData.parks_nearby.trim()) {
      newErrors.parks_nearby = "Number of parks nearby is required";
    } else if (isNaN(Number(formData.parks_nearby)) || Number(formData.parks_nearby) < 0) {
      newErrors.parks_nearby = "Number of parks must be 0 or greater";
    }

    if (!formData.public_transport_score.trim()) {
      newErrors.public_transport_score = "Public transport score is required";
    } else if (isNaN(Number(formData.public_transport_score)) ||
      Number(formData.public_transport_score) < 1 ||
      Number(formData.public_transport_score) > 5) {
      newErrors.public_transport_score = "Public transport score must be between 1 and 5";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        location: formData.location,
        price_DZD: parseFloat(formData.price_DZD),
        area: parseInt(formData.area, 10),
        property_type: formData.property_type,
        rooms: parseInt(formData.rooms, 10),
        schools_nearby: formData.schools_nearby ? parseInt(formData.schools_nearby, 10) : undefined,
        hospitals_nearby: formData.hospitals_nearby ? parseInt(formData.hospitals_nearby, 10) : undefined,
        parks_nearby: formData.parks_nearby ? parseInt(formData.parks_nearby, 10) : undefined,
        public_transport_score: formData.public_transport_score ? parseInt(formData.public_transport_score, 10) : undefined,
      };
      await updateProperty(propertyId, payload);
      router.push("/dashboard/properties");
    } catch (error) {
      // error handled by hook
    } finally {
      setIsSubmitting(false);
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
            <p className="text-muted-foreground">Loading property data...</p>
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
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The property you're trying to edit doesn't exist.
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
                <BreadcrumbLink href={`/dashboard/properties/${propertyId}`}>
                  {propertyId}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                Edit
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/properties/${propertyId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Property
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Property</h1>
            <p className="text-muted-foreground">
              Update property information and details
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Essential property details and identification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Property ID *</label>
                  <Input
                    placeholder="e.g., H0001"
                    value={formData.property_id}
                    onChange={(e) => handleInputChange("property_id", e.target.value)}
                    className={`mt-1 ${errors.property_id ? "border-destructive" : ""}`}
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground mt-1">Property ID cannot be changed</p>
                  {errors.property_id && (
                    <p className="text-sm text-destructive mt-1">{errors.property_id}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Location *</label>
                  <Input
                    placeholder="e.g., Algiers, Medea, Oran"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className={`mt-1 ${errors.location ? "border-destructive" : ""}`}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive mt-1">{errors.location}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Property Type *</label>
                  <select
                    value={formData.property_type}
                    onChange={(e) => handleInputChange("property_type", e.target.value)}
                    className={`mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ${errors.property_type ? "border-destructive" : ""}`}
                  >
                    <option value="">Select property type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.property_type && (
                    <p className="text-sm text-destructive mt-1">{errors.property_type}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Price (DZD) *</label>
                    <Input
                      type="number"
                      placeholder="e.g., 19537558"
                      value={formData.price_DZD}
                      onChange={(e) => handleInputChange("price_DZD", e.target.value)}
                      className={`mt-1 ${errors.price_DZD ? "border-destructive" : ""}`}
                    />
                    {errors.price_DZD && (
                      <p className="text-sm text-destructive mt-1">{errors.price_DZD}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Area (m²) *</label>
                    <Input
                      type="number"
                      placeholder="e.g., 232"
                      value={formData.area}
                      onChange={(e) => handleInputChange("area", e.target.value)}
                      className={`mt-1 ${errors.area ? "border-destructive" : ""}`}
                    />
                    {errors.area && (
                      <p className="text-sm text-destructive mt-1">{errors.area}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Number of Rooms *</label>
                  <Input
                    type="number"
                    placeholder="e.g., 2"
                    value={formData.rooms}
                    onChange={(e) => handleInputChange("rooms", e.target.value)}
                    className={`mt-1 ${errors.rooms ? "border-destructive" : ""}`}
                  />
                  {errors.rooms && (
                    <p className="text-sm text-destructive mt-1">{errors.rooms}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Nearby Amenities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Nearby Amenities
                </CardTitle>
                <CardDescription>
                  Information about nearby facilities and transport
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-1">
                    <School className="h-4 w-4" />
                    Schools Nearby *
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 2"
                    value={formData.schools_nearby}
                    onChange={(e) => handleInputChange("schools_nearby", e.target.value)}
                    className={`mt-1 ${errors.schools_nearby ? "border-destructive" : ""}`}
                  />
                  {errors.schools_nearby && (
                    <p className="text-sm text-destructive mt-1">{errors.schools_nearby}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    Hospitals Nearby *
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 2"
                    value={formData.hospitals_nearby}
                    onChange={(e) => handleInputChange("hospitals_nearby", e.target.value)}
                    className={`mt-1 ${errors.hospitals_nearby ? "border-destructive" : ""}`}
                  />
                  {errors.hospitals_nearby && (
                    <p className="text-sm text-destructive mt-1">{errors.hospitals_nearby}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Ruler className="h-4 w-4" />
                    Parks Nearby *
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 0"
                    value={formData.parks_nearby}
                    onChange={(e) => handleInputChange("parks_nearby", e.target.value)}
                    className={`mt-1 ${errors.parks_nearby ? "border-destructive" : ""}`}
                  />
                  {errors.parks_nearby && (
                    <p className="text-sm text-destructive mt-1">{errors.parks_nearby}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Bus className="h-4 w-4" />
                    Public Transport Score (1-5) *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    placeholder="e.g., 2"
                    value={formData.public_transport_score}
                    onChange={(e) => handleInputChange("public_transport_score", e.target.value)}
                    className={`mt-1 ${errors.public_transport_score ? "border-destructive" : ""}`}
                  />
                  {errors.public_transport_score && (
                    <p className="text-sm text-destructive mt-1">{errors.public_transport_score}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    1 = Poor, 2 = Fair, 3 = Good, 4 = Very Good, 5 = Excellent
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 mt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Property
                </>
              )}
            </Button>
            <Link href={`/dashboard/properties/${propertyId}`}>
              <Button variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 