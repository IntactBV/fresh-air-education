import ContentAnimation from '@faLayouts/content-animation';
import Footer from '@faLayouts/footer';
import Header from '@faLayouts/header';
import MainContainer from '@faLayouts/main-container';
import Overlay from '@faLayouts/overlay';
import ScrollToTop from '@faLayouts/scroll-to-top';
// import Setting from '@faLayouts/setting';
import Sidebar from '@faLayouts/sidebar';
import Portals from '@faComponents/portals';

export default function EduLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* BEGIN MAIN CONTAINER */}
            <div className="relative">
                <Overlay />
                <ScrollToTop />

                <MainContainer>
                    {/* BEGIN SIDEBAR */}
                    <Sidebar />
                    {/* END SIDEBAR */}
                    <div className="main-content flex min-h-screen flex-col">
                        {/* BEGIN TOP NAVBAR */}
                        <Header />
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
