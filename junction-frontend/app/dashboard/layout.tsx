import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"



export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="flex h-screen w-full">
      <AppSidebar />
      <main className="p-5 flex-1">
        {children}
      </main>
    </SidebarProvider>
  )
}