import { AppSidebar } from "@faeCommon/app-sidebar"
import {
  SidebarProvider,
} from "@ui/sidebar"

export default function EducationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider
    style={
      {
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
        backgroundPosition: 'top ccenter',
        backgroundSize: 'cover',
        backgroundImage: "url(https://www.wallpapergap.com/cdn/24/505/wallpaper-abstract-minimal-3840x2160.jpg)"
      } as React.CSSProperties
    }
  >
    <AppSidebar variant="inset" />
    {children}
  </SidebarProvider>
  );
}
