import 'react-perfect-scrollbar/dist/css/styles.css';
import EduLayout from '@faLayouts/edu-layout';
import '../../styles/tailwind.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <EduLayout>{children}</EduLayout>
    );
}
