import { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/utils/auth";

import ContentAnimation from '@faLayouts/content-animation';
import Footer from '@faLayouts/footer';
import Header from './header';
import MainContainer from '@faLayouts/main-container';
import Overlay from '@faLayouts/overlay';
import ScrollToTop from '@faLayouts/scroll-to-top';
import Sidebar from '@faLayouts/sidebar';
import Portals from '@faComponents/portals';

export default async function EduLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/autentificare");

  const role = session.user.role;

  if (role !== "student") {
    if (role === "admin") redirect("/admin");
    if (role === "tutore") redirect("/tutore");
    redirect("/autentificare");
  }

  return (
    <div className="relative">
      <Overlay />
      <ScrollToTop />
      <MainContainer>
        <Sidebar userRole="student" />
        <div className="main-content flex min-h-screen flex-col">
          <Header />
          <ContentAnimation>
            <div id="ContentWrapper" className="min-h-screen text-black dark:text-white-dark">
              {children}
            </div>
          </ContentAnimation>
          <Footer />
          <Portals />
        </div>
      </MainContainer>
    </div>
  );
}
