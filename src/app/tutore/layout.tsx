import 'react-perfect-scrollbar/dist/css/styles.css';
import TutoreLayout from '@faLayouts/tutore-layout';
import '../../styles/tailwind.css';

export default function RootLayout({ children, params }: { children: React.ReactNode, params: any }) {
    return (
        <TutoreLayout>{children}</TutoreLayout>
    );
}
