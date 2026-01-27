import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { NavigationSidebar } from "@/components/NavigationSidebar";
import Header from "@/components/Header";
import { Separator } from "@/components/ui/separator";

export function AppLayout({ children }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <NavigationSidebar />
      <SidebarInset className="m-0">
        <Header />
        <div className="flex flex-1 flex-col min-h-[calc(100vh-5rem)] pt-16 sm:pt-20 lg:pt-24">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
