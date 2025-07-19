"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Home,
  Building2,
  Users,
  UserCircle,
  User2,
  ChevronUp,
  TrendingUpDown,
  ArrowBigUpDash,
  Plus,
  Star,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

// Recommended Menu Items
const items = [
  {
    title: "Dashboard",
    url: "/dashboard", // The main overview page
    icon: Home, // Or a dashboard-specific icon like LayoutDashboard
  },
  {
    title: "Properties",
    url: "/dashboard/properties", // The page listing all properties
    icon: Building2, // An icon representing buildings or houses
  },
  {
    title: "Bulk Recommendations",
    url: "/dashboard/properties/bulk-recommendations",
    icon: Star, // Use a star or analytics icon
  },
  {
    title: "Compare Properties",
    url: "/dashboard/properties/compare",
    icon: ArrowBigUpDash, // Use an analytics or compare icon
  },
  {
    title: "Clients",
    url: "/dashboard/clients", // The page listing all clients
    icon: Users, // An icon representing people
  },
  {
    title: "Profile",
    url: "/dashboard/profile", // The agent's own profile page
    icon: UserCircle, // An icon for the user's own account
  },
];

const secondItems = [
  {
    title: "Recommend Contacts",
    url: "/dashboard/properties/predict-clients", // Predicting clients for properties
    icon: TrendingUpDown, // An icon representing prediction or analysis
  },
  {
    title: "Recommend Properties",
    url: "/dashboard/clients/predict-properties", // Predicting properties for clients
    icon: TrendingUpDown, // An icon representing properties
  },
];

const thirdItems = [
  {
    title: "Documentation",
    url: "/dashboard/apis-documentation", // API documentation page
    icon: ArrowBigUpDash, // An icon representing documentation or help
  },
];

export function AppSidebar() {
  const router = useRouter();
  return (
    <Sidebar className="w-64" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mb-20 text-xl mt-4">
            Dyarcom
          </SidebarGroupLabel>
          <SidebarGroupContent className="mb-5">
            <SidebarMenu>
              {/*  if its a client or property page we add plus icon that takes us to the page /add */}
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center justify-between"
                      onClick={(e) => {
                        // Prevent navigation if plus icon is clicked
                        if (
                          (item.title === "Clients" ||
                            item.title === "Properties") &&
                          (e.target as HTMLElement).closest(".plus-icon")
                        ) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <item.icon className="text-primary w-5" />
                        <span>{item.title}</span>
                      </div>

                      {(item.title === "Clients" ||
                        item.title === "Properties") && (
                          <span
                            className="ml-2 cursor-pointer plus-icon"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`${item.url}/add`);
                            }}
                          >
                            <Plus className="text-sm text-primary w-4" />
                          </span>
                        )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarSeparator />
          <SidebarGroupContent className="mt-5">
            <SidebarMenu>
              {secondItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="text-blue-950/50" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarGroupContent className="mt-15">
            <SidebarMenu>
              {thirdItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="text-blue-950/50" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarSeparator />
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="outline-hidden">
                <SidebarMenuButton>
                  <User2 /> Username
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] outline-hidden"
              >
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
