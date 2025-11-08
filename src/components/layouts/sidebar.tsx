/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Link from 'next/link';
import AnimateHeight from 'react-animate-height';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';

import type { IRootState } from '@/store';
import { toggleSidebar } from '@/store/themeConfigSlice';

import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconMinus from '@/components/icon/icon-minus';

import { SIDEBAR_MENUS } from './sidebar.config';

// Dacă ai un authSlice, poți citi rolul din store.
// Altfel, pasează `role` ca prop în layout-ul /edu /tutore /admin.
type UserRole = 'student' | 'tutor' | 'admin';

type SidebarProps = {
  userRole?: UserRole;          // dacă nu e dat, presupunem 'student'
};

const Sidebar = ({ userRole = 'admin' }: SidebarProps) => {
  const dispatch = useDispatch();
  const pathname = usePathname();

  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const semidark = themeConfig.semidark;

  const menuDef = SIDEBAR_MENUS[userRole];
  const basePath = menuDef.basePath;

  // pentru collapsible (dacă vei introduce collapse-uri în viitor)
  const [openKey, setOpenKey] = React.useState<string>('');
  const toggle = (key: string) => setOpenKey(prev => (prev === key ? '' : key));

  // Compose href: absolut (http) rămâne, altfel prefixăm cu basePath
  const wrapHref = (href: string) =>
    href.startsWith('http') ? href : `${basePath}${href === '/' ? '' : href}`;

  // activ: exact sau și pe subrute (în funcție de flag-ul item.exact)
  const isActive = (fullHref: string, exact?: boolean) =>
    exact ? pathname === fullHref : (pathname === fullHref || pathname.startsWith(fullHref + '/'));

  return (
    <div className={semidark ? 'dark' : ''}>
      <nav
        className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''
          }`}
      >
        <div className="h-full bg-white dark:bg-black">
          {/* Header + buton collapse */}
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="main-logo flex shrink-0 items-center">
              <img className="inline w-8 ltr:-ml-1 rtl:-mr-1" src="/assets/images/logo.png" alt="logo" />
              <span className="md:inline align-middle text-2xl font-semibold transition-all duration-300 ltr:ml-1.5 rtl:mr-1.5 text-[#ba2025] dark:text-[#ba2025]">
                FRESH AIR
              </span>
            </Link>

            <button
              type="button"
              className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
              onClick={() => dispatch(toggleSidebar())}
            >
              <IconCaretsDown className="m-auto rotate-90" />
            </button>
          </div>

          <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
            <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
              {menuDef.items.map((item, idx) => {
                // GROUP HEADER
                if (item.type === 'group') {
                  return (
                    <h2
                      key={`group-${idx}`}
                      className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]"
                    >
                      <IconMinus className="hidden h-5 w-4 flex-none" />
                      <span>{item.label}</span>
                    </h2>
                  );
                }

                // SIMPLE LINK
                if (item.type === 'link') {
                  const href = wrapHref(item.href);
                  const ActiveIcon = item.icon;
                  const active = isActive(href, item.exact);

                  return (
                    <li key={`link-${idx}`} className="menu nav-item">
                      <Link href={href} className={`group ${active ? 'active' : ''}`}>
                        <div className="flex items-center">
                          {ActiveIcon ? (
                            <ActiveIcon className="shrink-0 group-hover:!text-primary" />
                          ) : null}
                          <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                            {item.label}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                }

                // COLLAPSE (dacă vei folosi)
                if (item.type === 'collapse') {
                  const isOpen = openKey === item.label;
                  const Icon = item.icon;

                  return (
                    <li key={`collapse-${idx}`} className="menu nav-item">
                      <button
                        type="button"
                        className={`${isOpen ? 'active' : ''} nav-link group w-full`}
                        onClick={() => toggle(item.label)}
                      >
                        <div className="flex items-center">
                          {Icon ? <Icon className="shrink-0 group-hover:!text-primary" /> : null}
                          <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                            {item.label}
                          </span>
                        </div>
                        <div className={!isOpen ? '-rotate-90 rtl:rotate-90' : ''}>
                          <IconCaretDown />
                        </div>
                      </button>

                      <AnimateHeight duration={300} height={isOpen ? 'auto' : 0}>
                        <ul className="sub-menu text-gray-500">
                          {item.items.map((child, cidx) => {
                            const href = wrapHref(child.href);
                            const active = isActive(href);
                            return (
                              <li key={`collapse-link-${idx}-${cidx}`}>
                                <Link href={href} className={active ? 'active' : ''}>
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </AnimateHeight>
                    </li>
                  );
                }

                return null;
              })}
            </ul>
          </PerfectScrollbar>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
