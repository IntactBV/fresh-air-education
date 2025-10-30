import 'react-perfect-scrollbar/dist/css/styles.css';
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import BaseProvider from '@faProviders/base-provider';

import '../styles/tailwind.css';

export const metadata: Metadata = {
    title: {
        template: '%s | FreshAir Education',
        default: 'FreshAir Education',
    },
};
const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});



export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={nunito.variable}>
                <BaseProvider>{children}</BaseProvider>
            </body>
        </html>
    );
}
