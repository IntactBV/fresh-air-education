import 'react-perfect-scrollbar/dist/css/styles.css';
import AdminLayout from '@faLayouts/admin-layout';
import '../../styles/tailwind.css';

export default function RootLayout({ children, params }: { children: React.ReactNode, params: any }) {
    return (
        <AdminLayout>{children}</AdminLayout>
    );
}
