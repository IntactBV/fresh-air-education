const cookieObj = typeof window === 'undefined' ? require('next/headers') : require('universal-cookie');

import en from './locales/en.json';
const langObj: any = { en };

// const getLang = async () => {
//     let lang = null;
//     if (typeof window !== 'undefined') {
//         const cookies = new cookieObj.default(null, { path: '/' });
//         lang = await cookies.get('i18nextLng');
//     } else {
//         const cookies = cookieObj.cookies();
//         lang = await cookies.get('i18nextLng')?.value;
//     }
//     return lang;
// };

export const getTranslation = () => {
    // @TODO: change default lang to ro
    const lang = "en";
    const data: any = langObj[lang || 'en'];

    if (!data) {
        return { t: (key: string) => key, i18n: { language: 'en', changeLanguage: () => { } }, initLocale: () => { } };
    }

    const t = (key: string) => {
        return data[key] ? data[key] : key;
    };

    const initLocale = (themeLocale: string) => {
        // const lang = getLang();
        i18n.changeLanguage(lang || themeLocale);
    };

    const i18n = {
        language: lang,
        changeLanguage: (lang: string) => {
            const cookies = new cookieObj.default(null, { path: '/' });
            cookies.set('i18nextLng', lang);
        },
    };

    return { t, i18n, initLocale };
};
