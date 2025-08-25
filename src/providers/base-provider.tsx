'use client';

import store from '@/store';
import { Provider } from 'react-redux';
import React, { ReactNode, Suspense } from 'react';
import Loading from '@faComponents/layouts/loading';
import AppProvider from '@faProviders/app-provider';
// import { appWithI18Next } from 'ni18n';
// import { ni18nConfig } from '@fa/ni18n.config';

interface IProps {
    children?: ReactNode;
}

const BaseProvider = ({ children }: IProps) => {
    return (
        <Provider store={store}>
            <Suspense fallback={<Loading />}>
                <AppProvider>{children} </AppProvider>
            </Suspense>
        </Provider>
    );
};

export default BaseProvider;
// todo
// export default appWithI18Next(BaseProvider, ni18nConfig);
