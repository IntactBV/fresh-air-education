// components/layouts/edu-layout.tsx
import ContentAnimation from '@faLayouts/content-animation';
import Footer from '@faLayouts/footer';
import Header from '@faLayouts/header';
import MainContainer from '@faLayouts/main-container';
import Overlay from '@faLayouts/overlay';
import ScrollToTop from '@faLayouts/scroll-to-top';
import Sidebar from '@faLayouts/sidebar';
import Portals from '@faComponents/portals';
// import Setting from '@faLayouts/setting';
import Setting from '@/components/layouts/setting';

type EduLayoutProps = {
  children: React.ReactNode;
  userRole?: 'student' | 'tutor' | 'admin'; // NEW
};

export default function EduLayout({ children, userRole = 'student' }: EduLayoutProps) {
  return (
    <>
      <div className="relative">
        <Overlay />
        <ScrollToTop />
        <MainContainer>
          <Sidebar userRole={userRole} />
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
    </>
  );
}
