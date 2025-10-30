import Header from '@faLayouts/header';
import Footer from '@faLayouts/footer';
import PublicHeader from '@faLayouts/public-header';
import ContentAnimation from '@faLayouts/content-animation';
import MainContainer from '@faLayouts/main-container';
import Overlay from '@faLayouts/overlay';
import ScrollToTop from '@faLayouts/scroll-to-top';
import Setting from '@/components/layouts/setting';
// import Setting from '@faLayouts/setting';
import Portals from '@faComponents/portals';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* BEGIN MAIN CONTAINER */}
            <div className="relative">
                {/* <Overlay /> */}
                <ScrollToTop />

                {/* BEGIN APP SETTING LAUNCHER */}
                {/* <Setting /> */}
                {/* END APP SETTING LAUNCHER */}

                <MainContainer>
                    {/* BEGIN SIDEBAR */}
                    {/* <Sidebar /> */}
                    {/* END SIDEBAR */}
                    <div className="flex min-h-screen flex-col">
                        {/* BEGIN TOP NAVBAR */}
                        <Header />
                        {/* <PublicHeader /> */}
                        {/* END TOP NAVBAR */}

                        {/* BEGIN CONTENT AREA */}
                        <ContentAnimation>
                            <div id="ContentWrapper" className="min-h-screen text-black dark:text-white-dark">{children} </div>
                        </ContentAnimation>
                        {/* END CONTENT AREA */}

                        {/* BEGIN FOOTER */}
                        <Footer />
                        {/* END FOOTER */}
                        <Portals />
                    </div>
                </MainContainer>
            </div>
        </>
    );
}
