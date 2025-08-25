import ContentAnimation from '@faLayouts/content-animation';
import MainContainer from '@faLayouts/main-container';
import Overlay from '@faLayouts/overlay';
import ScrollToTop from '@faLayouts/scroll-to-top';
// import Setting from '@faLayouts/setting';
import Portals from '@faComponents/portals';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* BEGIN MAIN CONTAINER */}
            <div className="relative">
                <Overlay />
                <ScrollToTop />

                <MainContainer>
                    {/* BEGIN SIDEBAR */}
                    {/* <Sidebar /> */}
                    {/* END SIDEBAR */}
                    <div className="flex min-h-screen flex-col">
                        {/* BEGIN TOP NAVBAR */}
                        {/* <Header /> */}
                        {/* END TOP NAVBAR */}

                        {/* BEGIN CONTENT AREA */}
                        <ContentAnimation>
                            <div id="ContentWrapper" className="min-h-screen text-black dark:text-white-dark">{children} </div>
                        </ContentAnimation>
                        {/* END CONTENT AREA */}

                        {/* BEGIN FOOTER */}
                        {/* <Footer /> */}
                        {/* END FOOTER */}
                        <Portals />
                    </div>
                </MainContainer>
            </div>
        </>
    );
}
