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
import { useState } from "react";
import {
  ArrowLeft,
  Save,
  User,
  MapPin,
  DollarSign,
  Home,
  Bed,
  School,
  Heart,
  Bus,
  Plus,
  Target,
  Baby,
  Heart as HeartIcon
} from "lucide-react";
import Link from "next/link";
import { useClients } from "@/hooks/use-api";
import { useRouter } from "next/navigation";

const propertyTypes = ["apartment", "house", "villa", "studio", "penthouse"];
const maritalStatuses = ["single", "married", "divorced", "widowed"];

export default function AddClientPage() {
  const pathname = usePathname();
  const segments = pathname.replace(/^\/|\/$/g, "").split("/");
  const first = segments[segments.length - 3] || "Dashboard";
  const second = segments[segments.length - 2];

  // API integration
  const { createClient, loading, error } = useClients();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    client_id: "",
    preferred_location: "",
    min_budget_DZD: "",
    max_budget_DZD: "",
    min_area: "",
    max_area: "",
    preferred_property_type: "",
    marital_status: "",
    has_kids: "",
    weight_location: "",
    weight_property_type: "",
    preferred_rooms: "",
    weight_rooms: "",
    preferred_schools_nearby: "",
    weight_schools_nearby: "",
    preferred_hospitals_nearby: "",
    weight_hospitals_nearby: "",
    preferred_parks_nearby: "",
    weight_parks_nearby: "",
    preferred_public_transport_score: "",
    weight_public_transport_score: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!formData.client_id.trim()) {
      newErrors.client_id = "Client ID is required";
    }

    if (!formData.preferred_location.trim()) {
      newErrors.preferred_location = "Preferred location is required";
    }

    if (!formData.min_budget_DZD.trim()) {
      newErrors.min_budget_DZD = "Minimum budget is required";
    } else if (isNaN(Number(formData.min_budget_DZD)) || Number(formData.min_budget_DZD) <= 0) {
      newErrors.min_budget_DZD = "Minimum budget must be a positive number";
    }

    if (!formData.max_budget_DZD.trim()) {
      newErrors.max_budget_DZD = "Maximum budget is required";
    } else if (isNaN(Number(formData.max_budget_DZD)) || Number(formData.max_budget_DZD) <= 0) {
      newErrors.max_budget_DZD = "Maximum budget must be a positive number";
    }

    if (Number(formData.min_budget_DZD) >= Number(formData.max_budget_DZD)) {
      newErrors.max_budget_DZD = "Maximum budget must be greater than minimum budget";
    }

    if (!formData.min_area.trim()) {
      newErrors.min_area = "Minimum area is required";
    } else if (isNaN(Number(formData.min_area)) || Number(formData.min_area) <= 0) {
      newErrors.min_area = "Minimum area must be a positive number";
    }

    if (!formData.max_area.trim()) {
      newErrors.max_area = "Maximum area is required";
    } else if (isNaN(Number(formData.max_area)) || Number(formData.max_area) <= 0) {
      newErrors.max_area = "Maximum area must be a positive number";
    }

    if (Number(formData.min_area) >= Number(formData.max_area)) {
      newErrors.max_area = "Maximum area must be greater than minimum area";
    }

    if (!formData.preferred_property_type) {
      newErrors.preferred_property_type = "Preferred property type is required";
    }

    if (!formData.marital_status) {
      newErrors.marital_status = "Marital status is required";
    }

    if (!formData.has_kids) {
      newErrors.has_kids = "Please specify if client has kids";
    }

    if (!formData.preferred_rooms.trim()) {
      newErrors.preferred_rooms = "Preferred number of rooms is required";
    } else if (isNaN(Number(formData.preferred_rooms)) || Number(formData.preferred_rooms) <= 0) {
      newErrors.preferred_rooms = "Preferred rooms must be a positive number";
    }

    // Validate weights (0-1 range)
    const weightFields = [
      'weight_location', 'weight_property_type', 'weight_rooms',
      'weight_schools_nearby', 'weight_hospitals_nearby', 'weight_parks_nearby',
      'weight_public_transport_score'
    ];

    weightFields.forEach(field => {
      if (!formData[field as keyof typeof formData].trim()) {
        newErrors[field] = `${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} weight is required`;
      } else {
        const weight = Number(formData[field as keyof typeof formData]);
        if (isNaN(weight) || weight < 0 || weight > 1) {
          newErrors[field] = "Weight must be between 0 and 1";
        }
      }
    });

    // Validate preference counts
    const preferenceFields = [
      'preferred_schools_nearby', 'preferred_hospitals_nearby', 'preferred_parks_nearby'
    ];

    preferenceFields.forEach(field => {
      if (!formData[field as keyof typeof formData].trim()) {
        newErrors[field] = `${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
      } else if (isNaN(Number(formData[field as keyof typeof formData])) || Number(formData[field as keyof typeof formData]) < 0) {
        newErrors[field] = "Must be 0 or greater";
      }
    });

    if (!formData.preferred_public_transport_score.trim()) {
      newErrors.preferred_public_transport_score = "Preferred public transport score is required";
    } else {
      const score = Number(formData.preferred_public_transport_score);
      if (isNaN(score) || score < 1 || score > 10) {
        newErrors.preferred_public_transport_score = "Score must be between 1 and 10";
      }
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
      // Build payload with required fields
      const payload: any = {
        client_id: formData.client_id,
        preferred_location: formData.preferred_location,
        min_budget_DZD: Number(formData.min_budget_DZD),
        max_budget_DZD: Number(formData.max_budget_DZD),
        min_area: Number(formData.min_area),
        max_area: Number(formData.max_area),
        preferred_property_type: formData.preferred_property_type,
        marital_status: formData.marital_status,
        has_kids: formData.has_kids === "true",
      };
      // Add optional fields only if filled (and not empty string)
      const optionalFields = [
        "weight_location", "weight_property_type", "preferred_rooms", "weight_rooms",
        "preferred_schools_nearby", "weight_schools_nearby", "preferred_hospitals_nearby", "weight_hospitals_nearby",
        "preferred_parks_nearby", "weight_parks_nearby", "preferred_public_transport_score", "weight_public_transport_score"
      ];
      optionalFields.forEach(field => {
        const value = formData[field as keyof typeof formData];
        // Only add if user entered a value (not empty string)
        if (value !== "" && value !== undefined && value !== null) {
          payload[field] = Number(value);
        }
      });
      await createClient(payload);
      router.push("/dashboard/clients");
    } catch (error) {
      // error is handled by hook
    } finally {
      setIsSubmitting(false);
    }
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
                <BreadcrumbLink href="/dashboard/clients">
                  {second.charAt(0).toUpperCase() + second.slice(1)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                Add Client
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clients">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Add New Client</h1>
            <p className="text-muted-foreground">
              Create a new client profile with all preferences and requirements
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Client identification and basic details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Client ID *</label>
                  <Input
                    placeholder="e.g., CLT0001"
                    value={formData.client_id}
                    onChange={(e) => handleInputChange("client_id", e.target.value)}
                    className={`mt-1 ${errors.client_id ? "border-destructive" : ""}`}
                  />
                  {errors.client_id && (
                    <p className="text-sm text-destructive mt-1">{errors.client_id}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Preferred Location *</label>
                  <Input
                    placeholder="e.g., Algiers, Medea, Oran"
                    value={formData.preferred_location}
                    onChange={(e) => handleInputChange("preferred_location", e.target.value)}
                    className={`mt-1 ${errors.preferred_location ? "border-destructive" : ""}`}
                  />
                  {errors.preferred_location && (
                    <p className="text-sm text-destructive mt-1">{errors.preferred_location}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Marital Status *</label>
                    <select
                      value={formData.marital_status}
                      onChange={(e) => handleInputChange("marital_status", e.target.value)}
                      className={`mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ${errors.marital_status ? "border-destructive" : ""}`}
                    >
                      <option value="">Select status</option>
                      {maritalStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.marital_status && (
                      <p className="text-sm text-destructive mt-1">{errors.marital_status}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Has Kids *</label>
                    <select
                      value={formData.has_kids}
                      onChange={(e) => handleInputChange("has_kids", e.target.value)}
                      className={`mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ${errors.has_kids ? "border-destructive" : ""}`}
                    >
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                    {errors.has_kids && (
                      <p className="text-sm text-destructive mt-1">{errors.has_kids}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Budget Information
                </CardTitle>
                <CardDescription>
                  Client's budget range and financial preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Min Budget (DZD) *</label>
                    <Input
                      type="number"
                      placeholder="e.g., 15000000"
                      value={formData.min_budget_DZD}
                      onChange={(e) => handleInputChange("min_budget_DZD", e.target.value)}
                      className={`mt-1 ${errors.min_budget_DZD ? "border-destructive" : ""}`}
                    />
                    {errors.min_budget_DZD && (
                      <p className="text-sm text-destructive mt-1">{errors.min_budget_DZD}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Budget (DZD) *</label>
                    <Input
                      type="number"
                      placeholder="e.g., 35000000"
                      value={formData.max_budget_DZD}
                      onChange={(e) => handleInputChange("max_budget_DZD", e.target.value)}
                      className={`mt-1 ${errors.max_budget_DZD ? "border-destructive" : ""}`}
                    />
                    {errors.max_budget_DZD && (
                      <p className="text-sm text-destructive mt-1">{errors.max_budget_DZD}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Min Area (m²) *</label>
                    <Input
                      type="number"
                      placeholder="e.g., 80"
                      value={formData.min_area}
                      onChange={(e) => handleInputChange("min_area", e.target.value)}
                      className={`mt-1 ${errors.min_area ? "border-destructive" : ""}`}
                    />
                    {errors.min_area && (
                      <p className="text-sm text-destructive mt-1">{errors.min_area}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Area (m²) *</label>
                    <Input
                      type="number"
                      placeholder="e.g., 200"
                      value={formData.max_area}
                      onChange={(e) => handleInputChange("max_area", e.target.value)}
                      className={`mt-1 ${errors.max_area ? "border-destructive" : ""}`}
                    />
                    {errors.max_area && (
                      <p className="text-sm text-destructive mt-1">{errors.max_area}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  Property Preferences
                </CardTitle>
                <CardDescription>
                  Client's property type and room preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Preferred Property Type *</label>
                  <select
                    value={formData.preferred_property_type}
                    onChange={(e) => handleInputChange("preferred_property_type", e.target.value)}
                    className={`mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ${errors.preferred_property_type ? "border-destructive" : ""}`}
                  >
                    <option value="">Select property type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.preferred_property_type && (
                    <p className="text-sm text-destructive mt-1">{errors.preferred_property_type}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Preferred Rooms *</label>
                    <Input
                      type="number"
                      placeholder="e.g., 3"
                      value={formData.preferred_rooms}
                      onChange={(e) => handleInputChange("preferred_rooms", e.target.value)}
                      className={`mt-1 ${errors.preferred_rooms ? "border-destructive" : ""}`}
                    />
                    {errors.preferred_rooms && (
                      <p className="text-sm text-destructive mt-1">{errors.preferred_rooms}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Property Type Weight (0-1) *</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="0" max="1" step="0.01" value={formData.weight_property_type} onChange={(e) => handleInputChange("weight_property_type", e.target.value)} className="w-full" />
                      <span className="w-10 text-right text-xs">{formData.weight_property_type}</span>
                    </div>
                    {errors.weight_property_type && (
                      <p className="text-sm text-destructive mt-1">{errors.weight_property_type}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Location Weight (0-1) *</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="0" max="1" step="0.01" value={formData.weight_location} onChange={(e) => handleInputChange("weight_location", e.target.value)} className="w-full" />
                      <span className="w-10 text-right text-xs">{formData.weight_location}</span>
                    </div>
                    {errors.weight_location && (
                      <p className="text-sm text-destructive mt-1">{errors.weight_location}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rooms Weight (0-1) *</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="0" max="1" step="0.01" value={formData.weight_rooms} onChange={(e) => handleInputChange("weight_rooms", e.target.value)} className="w-full" />
                      <span className="w-10 text-right text-xs">{formData.weight_rooms}</span>
                    </div>
                    {errors.weight_rooms && (
                      <p className="text-sm text-destructive mt-1">{errors.weight_rooms}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Amenities Preferences
                </CardTitle>
                <CardDescription>
                  Client's preferences for nearby facilities and transport
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      <School className="h-4 w-4" />
                      Schools Nearby *
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 2"
                      value={formData.preferred_schools_nearby}
                      onChange={(e) => handleInputChange("preferred_schools_nearby", e.target.value)}
                      className={`mt-1 ${errors.preferred_schools_nearby ? "border-destructive" : ""}`}
                    />
                    {errors.preferred_schools_nearby && (
                      <p className="text-sm text-destructive mt-1">{errors.preferred_schools_nearby}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Schools Weight (0-1) *</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="0" max="1" step="0.01" value={formData.weight_schools_nearby} onChange={(e) => handleInputChange("weight_schools_nearby", e.target.value)} className="w-full" />
                      <span className="w-10 text-right text-xs">{formData.weight_schools_nearby}</span>
                    </div>
                    {errors.weight_schools_nearby && (
                      <p className="text-sm text-destructive mt-1">{errors.weight_schools_nearby}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      Hospitals Nearby *
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 1"
                      value={formData.preferred_hospitals_nearby}
                      onChange={(e) => handleInputChange("preferred_hospitals_nearby", e.target.value)}
                      className={`mt-1 ${errors.preferred_hospitals_nearby ? "border-destructive" : ""}`}
                    />
                    {errors.preferred_hospitals_nearby && (
                      <p className="text-sm text-destructive mt-1">{errors.preferred_hospitals_nearby}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hospitals Weight (0-1) *</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="0" max="1" step="0.01" value={formData.weight_hospitals_nearby} onChange={(e) => handleInputChange("weight_hospitals_nearby", e.target.value)} className="w-full" />
                      <span className="w-10 text-right text-xs">{formData.weight_hospitals_nearby}</span>
                    </div>
                    {errors.weight_hospitals_nearby && (
                      <p className="text-sm text-destructive mt-1">{errors.weight_hospitals_nearby}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Bus className="h-4 w-4" />
                      Parks Nearby *
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 1"
                      value={formData.preferred_parks_nearby}
                      onChange={(e) => handleInputChange("preferred_parks_nearby", e.target.value)}
                      className={`mt-1 ${errors.preferred_parks_nearby ? "border-destructive" : ""}`}
                    />
                    {errors.preferred_parks_nearby && (
                      <p className="text-sm text-destructive mt-1">{errors.preferred_parks_nearby}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Parks Weight (0-1) *</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="0" max="1" step="0.01" value={formData.weight_parks_nearby} onChange={(e) => handleInputChange("weight_parks_nearby", e.target.value)} className="w-full" />
                      <span className="w-10 text-right text-xs">{formData.weight_parks_nearby}</span>
                    </div>
                    {errors.weight_parks_nearby && (
                      <p className="text-sm text-destructive mt-1">{errors.weight_parks_nearby}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Public Transport Score (1-10) *</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="e.g., 7"
                      value={formData.preferred_public_transport_score}
                      onChange={(e) => handleInputChange("preferred_public_transport_score", e.target.value)}
                      className={`mt-1 ${errors.preferred_public_transport_score ? "border-destructive" : ""}`}
                    />
                    {errors.preferred_public_transport_score && (
                      <p className="text-sm text-destructive mt-1">{errors.preferred_public_transport_score}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Transport Weight (0-1) *</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="0" max="1" step="0.01" value={formData.weight_public_transport_score} onChange={(e) => handleInputChange("weight_public_transport_score", e.target.value)} className="w-full" />
                      <span className="w-10 text-right text-xs">{formData.weight_public_transport_score}</span>
                    </div>
                    {errors.weight_public_transport_score && (
                      <p className="text-sm text-destructive mt-1">{errors.weight_public_transport_score}</p>
                    )}
                  </div>
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Client
                </>
              )}
            </Button>
            <Link href="/dashboard/clients">
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
