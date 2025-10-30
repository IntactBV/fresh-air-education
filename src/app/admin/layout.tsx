import 'react-perfect-scrollbar/dist/css/styles.css';
import AdminLayout from '@faLayouts/admin-layout';
import '../../styles/tailwind.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminLayout>{children}</AdminLayout>
    );
}
