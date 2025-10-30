import type { Metadata } from 'next';
import MaterialeComponent from './materialeComponent';

export const metadata: Metadata = {
  title: 'Materiale',
};

export default async function Page() {
  return (
    <MaterialeComponent />
  );
}
