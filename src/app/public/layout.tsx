import PublicLayout from '@faLayouts/public-layout';

export default function PublicMainLayout({ children }: { children: React.ReactNode }) {
    return (
        <PublicLayout>{children}</PublicLayout>
    );
}
