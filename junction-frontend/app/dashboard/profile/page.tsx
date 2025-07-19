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
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Award,
  Clock
} from "lucide-react";

// Mock user data - in real app this would come from auth context or API
const mockUser = {
  id: "USR001",
  name: "Ahmed Benali",
  email: "ahmed.benali@realestate.com",
  phone: "+213 5 55 12 34 56",
  role: "Senior Real Estate Agent",
  location: "Algiers, Algeria",
  joinDate: "2022-03-15",
  experience: "5 years",
  specializations: ["Residential", "Commercial", "Luxury Properties"],
  totalProperties: 127,
  totalClients: 89,
  successRate: "94%",
  languages: ["Arabic", "French", "English"],
  license: "REA-2022-001234",
  bio: "Experienced real estate professional specializing in residential and commercial properties across Algeria. Committed to providing exceptional service and finding the perfect properties for our clients.",
  avatar: "/api/placeholder/150/150"
};

export default function ProfilePage() {
  const pathname = usePathname();
  const segments = pathname.replace(/^\/|\/$/g, "").split("/");
  const first = segments[segments.length - 2] || "Dashboard";

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
                Profile
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Your account information and professional details
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-xl">{mockUser.name}</CardTitle>
              <CardDescription className="text-base font-medium text-primary">
                {mockUser.role}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{mockUser.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{mockUser.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{mockUser.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Joined {new Date(mockUser.joinDate).toLocaleDateString("en-GB")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{mockUser.experience} experience</span>
              </div>
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">License: {mockUser.license}</span>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bio */}
              <div>
                <h3 className="font-medium mb-2">About Me</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {mockUser.bio}
                </p>
              </div>

              {/* Specializations */}
              <div>
                <h3 className="font-medium mb-2">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {mockUser.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <h3 className="font-medium mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {mockUser.languages.map((lang) => (
                    <Badge key={lang} variant="outline">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{mockUser.totalProperties}</div>
                  <div className="text-sm text-muted-foreground">Properties</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{mockUser.totalClients}</div>
                  <div className="text-sm text-muted-foreground">Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{mockUser.successRate}</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
