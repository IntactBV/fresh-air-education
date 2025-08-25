import ComponentsPagesFaqWithTabs from '@faComponents/pages/components-pages-faq-with-tabs';
import { type Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Prima pagina',
};

const Home = () => {
  return (
    <ComponentsPagesFaqWithTabs />
  );
};

export default Home;
