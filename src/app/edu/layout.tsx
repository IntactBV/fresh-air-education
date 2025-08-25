import 'react-perfect-scrollbar/dist/css/styles.css';
import { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import BaseProvider from '@faProviders/base-provider';

import '../../styles/tailwind.css';
import EduLayout from '@faLayouts/edu-layout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <EduLayout>{children}</EduLayout>
    );
}
