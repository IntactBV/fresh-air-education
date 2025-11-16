'use client';
import { useEffect, useCallback, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import type { IRootState } from '@/store';
import { toggleTheme, toggleSidebar } from '@/store/themeConfigSlice';
import Dropdown from '@/components/dropdown';
import IconMenu from '@/components/icon/icon-menu';
import IconSun from '@/components/icon/icon-sun';
import IconMoon from '@/components/icon/icon-moon';
import IconLaptop from '@/components/icon/icon-laptop';
import IconUser from '@/components/icon/icon-user';
import IconLogout from '@/components/icon/icon-logout';
import IconLogin from '@/components/icon/icon-login';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@fa/utils/auth-client';
import IconServer from '@faComponents/icon/icon-server';
import Image from 'next/image';

enum EUserTypes {
    Student = 'student',
    Tutore = 'tutore',
    Admin = 'admin',
}

type AuthUser = {
    id: string;
    name: string;
    email: string;
    type: string;
    avatarUrl: string;
} | null;

const Header = () => {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const router = useRouter();
    const { data: session, isPending: sessionLoading } = authClient.useSession();

    useEffect(() => {
        const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }

            let allLinks = document.querySelectorAll('ul.horizontal-menu a.active');
            for (let i = 0; i < allLinks.length; i++) {
                const element = allLinks[i];
                element?.classList.remove('active');
            }
            selector?.classList.add('active');

            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }, [pathname]);

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    const [auth, setAuth] = useState<{ isAuthenticated: boolean; user: AuthUser }>({
        isAuthenticated: false,
        user: null,
    });

    const mapSessionRoleToUserType = (role?: string): EUserTypes => {
        if (!role) return EUserTypes.Student;
        if (role === 'admin') return EUserTypes.Admin;
        if (role === 'tutore') return EUserTypes.Tutore;
        return EUserTypes.Student;
    };

    const syncAuthFromSession = useCallback(
        (doRedirect: boolean) => {
            const sUser = session?.user;
            if (!sUser) {
                setAuth({ isAuthenticated: false, user: null });
                return;
            }

            const mappedType = mapSessionRoleToUserType(sUser.role as string | undefined);

            const mappedUser: AuthUser = {
                id: sUser.id,
                name: sUser.name || sUser.email,
                email: sUser.email,
                type: mappedType,
                avatarUrl: sUser.image || '/assets/images/user-profile.jpeg',
            };

            setAuth({ isAuthenticated: true, user: mappedUser });

            if (doRedirect) {
                if (mappedType === EUserTypes.Admin) router.push('/admin');
                else if (mappedType === EUserTypes.Tutore) router.push('/tutore');
                else router.push('/edu');
            }
        },
        [session, router]
    );

    const login = useCallback(() => {
        const sUser = session?.user;

        if (!sUser) {
            router.push("/autentificare");
            return;
        }

        const mappedType = mapSessionRoleToUserType(sUser.role as string | undefined);

        if (mappedType === EUserTypes.Admin) router.push("/admin");
        else if (mappedType === EUserTypes.Tutore) router.push("/tutore");
        else router.push("/edu");
    }, [session, router]);

    const logout = useCallback(async () => {
        setAuth({ isAuthenticated: false, user: null });
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push('/public');
                },
            },
        });
    }, [router]);

    function getInitials(name: string | undefined) {
        if (!name) return 'NA';
        return name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase())
            .join('');
    }

    const initials = useMemo(
        () => getInitials(session?.user?.name || session?.user?.email),
        [session?.user]
    );

    const isEduRoute = pathname.startsWith('/edu');
    const isAdminRoute = pathname.startsWith('/admin');
    const isTutoreRoute = pathname.startsWith('/tutore');
    const isPublicRoute = !isEduRoute && !isAdminRoute && !isTutoreRoute;

    useEffect(() => {
        if (sessionLoading) return;
        syncAuthFromSession(false);
    }, [sessionLoading, isEduRoute, isAdminRoute, isTutoreRoute, syncAuthFromSession]);

    if (sessionLoading) return <span>Loading…</span>;

    const currentUserPlatformUrl =
        session?.user?.role === 'admin'
            ? '/admin'
            : session?.user?.role === 'tutore'
            ? '/tutore'
            : '/edu';

    const myAccountUrl = `${currentUserPlatformUrl}/contul-meu`;
    const redirectToPlatformMenuLabel =
        session?.user?.role === 'admin'
            ? 'Platforma Admin'
            : session?.user?.role === 'tutore'
            ? 'Platforma Tutore'
            : 'Platforma Educationala';

    // === Theme toggle unificat (ciclic) ===
    const cycleTheme = () => {
        const current = themeConfig.theme; // 'light' | 'dark' | 'system'
        const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
        dispatch(toggleTheme(next));
    };

    const ThemeIcon = () => {
        if (themeConfig.theme === 'light') return <IconSun />;
        if (themeConfig.theme === 'dark') return <IconMoon />;
        return <IconLaptop />;
    };

    // stil comun pentru icon buttons din header
    const iconBtn =
        'flex items-center justify-center h-9 w-9 rounded-full ring-1 ring-zinc-200/70 hover:ring-zinc-300 dark:ring-white/10 dark:hover:ring-white/20 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60';

    return (
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
            <div className="border-b border-zinc-200/70 dark:border-white/10 bg-white/90 dark:bg-black/90">
                <div className="relative flex w-full items-center">
                    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-2.5 flex items-center gap-3">
                        {/* Brand + (toggle sidebar pe rute interne) */}
                        <div className={`horizontal-logo flex items-center justify-between ltr:mr-2 rtl:ml-2 ${isEduRoute || isAdminRoute || isTutoreRoute ? 'lg:hidden' : ''}`}>
                            <Link
                              href="/"
                              className="main-logo flex shrink-0 items-center gap-2 group"
                            >
                              <div className="relative h-8 w-8 overflow-hidden rounded-md">
                                <Image
                                  src="/assets/images/logo.png"
                                  alt="logo"
                                  width={32}
                                  height={32}
                                  sizes="32px"
                                  className="
                                    h-full w-full object-contain
                                    transition-transform duration-500
                                    group-hover:animate-spinSlow
                                  "
                                />
                              </div>

                              <span
                                className="
                                  hidden md:inline
                                  align-middle
                                  font-sans
                                  text-[1.15rem] leading-[1.2rem]
                                  font-semibold
                                  tracking-tight
                                  select-none
                                  text-zinc-800 dark:text-zinc-100
                                "
                              >
                                <span className="inline-block align-baseline text-[1.28rem] leading-none">
                                  F
                                </span>
                                RESH{" "}
                                <span className="inline-block align-baseline text-[1.28rem] leading-none text-primary">
                                  T
                                </span>
                                <span className="text-primary">ECH</span>
                              </span>
                            </Link>

                            {auth.isAuthenticated && (isEduRoute || isAdminRoute || isTutoreRoute) && (
                                <button
                                    type="button"
                                    className={`${iconBtn} ltr:ml-2 rtl:mr-2`}
                                    onClick={() => dispatch(toggleSidebar())}
                                    aria-label="Toggle sidebar"
                                >
                                    <IconMenu className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Actiuni dreapta */}
                        <div className="flex items-center justify-end gap-2 rtl:space-x-reverse dark:text-[#d0d2d6]">
                          {/* CTA public pentru guest: Inscriere Studenti */}
                          {!auth.isAuthenticated && isPublicRoute && (
                            <Link
                              href="/public/formular-de-inscriere-studenti"
                              className="group relative hidden sm:inline-flex h-9 items-center gap-2 overflow-hidden rounded-full 
                                        bg-gradient-to-r from-primary to-blue-500 px-4 text-sm font-semibold text-white 
                                        shadow-sm transition-all duration-150 hover:brightness-110 active:scale-[0.99] 
                                        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                              aria-label="Inscriere Studenti"
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4 opacity-95" fill="currentColor" aria-hidden="true">
                                <path d="M12 3 1 8l11 5 8-3.636V15h2V8L12 3Zm0 13.343L6 13v3.5c0 1.657 2.686 3 6 3s6-1.343 6-3V13l-6 3.343Z" />
                              </svg>
                              <span className="relative z-10">Inscriere Studenti</span>
                              <span className="translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
                                →
                              </span>
                            </Link>
                          )}

                          {/* Separator între CTA și clusterul de utilitare */}
                          {!auth.isAuthenticated && isPublicRoute && (
                            <div role="separator" className="mx-1 hidden h-5 w-px bg-zinc-200/70 dark:bg-white/15 sm:block" />
                          )}

                          {/* Utility cluster: Theme toggle + Avatar */}
                          <div className="flex items-center gap-1.5 rounded-full p-0.5 ring-1 ring-zinc-200/70 dark:ring-white/10">
                            {/* Theme toggle unificat */}
                            <button
                              className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-zinc-100/80 dark:hover:bg-white/10
                                        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                              onClick={cycleTheme}
                              aria-label={`Schimba tema (${themeConfig.theme})`}
                              title={`Tema: ${themeConfig.theme}`}
                            >
                              <ThemeIcon />
                            </button>

                            {/* Avatar / User menu */}
                            <div className="dropdown">
                              {/* GUEST */}
                              {!auth.isAuthenticated && (
                                <Dropdown
                                  offset={[0, 8]}
                                  placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                  btnClassName="relative group block"
                                  button={
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 hover:bg-zinc-300/80 dark:hover:bg-zinc-600/80 transition">
                                      <IconUser className="w-5 h-5" />
                                    </span>
                                  }
                                >
                                  <ul className="w-[240px] !py-0 font-semibold text-dark dark:text-white-dark dark:text-white-light/90 divide-y divide-zinc-200/70 dark:divide-white/10">
                                    <li>
                                      <button
                                        type="button"
                                        onClick={login}
                                        className="w-full flex items-center px-4 py-3 text-left dark:hover:text-white"
                                      >
                                        <IconLogin className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                        Autentificare
                                      </button>
                                    </li>
                                    <li>
                                      <Link href="/public/formular-de-inscriere-studenti" className="flex items-center px-4 py-3 text-info">
                                        <IconLogin className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                        Inscriere Studenti
                                      </Link>
                                    </li>
                                  </ul>
                                </Dropdown>
                              )}

                              {/* AUTHENTICATED */}
                              {auth.isAuthenticated && (
                                <Dropdown
                                  offset={[20, 8]}
                                  placement={'bottom-end'}
                                  btnClassName="relative group block"
                                  button={
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-info text-white text-sm font-semibold">
                                      {initials}
                                    </span>
                                  }
                                >
                                  <ul className="w-[350px] !py-0 font-semibold text-dark dark:text-white-dark dark:text-white-light/90 divide-y divide-zinc-200/70 dark:divide-white/10">
                                    <li>
                                      <div className="flex items-center px-4 py-4">
                                        <div className="h-14 w-14 flex items-center justify-center rounded-md border text-sm font-semibold">
                                          {initials}
                                        </div>
                                        <div className="truncate ltr:pl-4 rtl:pr-4">
                                          <h4 className="text-base">
                                            {session?.user?.name || "User"}
                                            
                                          </h4>
                                          <button
                                            type="button"
                                            className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white font-mono text-xs"
                                            title={session?.user?.email}
                                          >
                                            {session?.user?.email}
                                          </button>
                                          <h4 className="text-base">
                                            {session?.user?.role && (
                                              <span className="rounded bg-success-light text-xs text-success">
                                                {session.user?.role}
                                              </span>
                                            )}
                                          </h4>
                                        </div>
                                      </div>
                                    </li>
                                    <li>
                                      <Link href={currentUserPlatformUrl} className="flex items-center px-4 py-3 dark:hover:text-white">
                                        <IconServer className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                        {redirectToPlatformMenuLabel}
                                      </Link>
                                    </li>
                                    <li>
                                      <Link href={myAccountUrl} className="flex items-center px-4 py-3 dark:hover:text-white">
                                        <IconUser className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                        Contul meu
                                      </Link>
                                    </li>
                                    <li>
                                      <button
                                        type="button"
                                        onClick={logout}
                                        className="w-full flex items-center px-4 py-3 text-left text-danger"
                                      >
                                        <IconLogout className="h-4.5 w-4.5 shrink-0 rotate-90 ltr:mr-2 rtl:ml-2" />
                                        Deconectare
                                      </button>
                                    </li>
                                  </ul>
                                </Dropdown>
                              )}
                            </div>
                          </div>
                        </div>

                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
