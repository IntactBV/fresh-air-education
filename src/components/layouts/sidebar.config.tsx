// components/layouts/sidebar.config.tsx
import React from 'react';

import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconMenuDatatables from '@/components/icon/menu/icon-menu-datatables';
import IconMenuPages from '@/components/icon/menu/icon-menu-pages';
import IconMenuAuthentication from '@/components/icon/menu/icon-menu-authentication';
import IconMenuDocumentation from '@/components/icon/menu/icon-menu-documentation';
import IconMenuChat from '@/components/icon/menu/icon-menu-chat';
import IconMenuInvoice from '@/components/icon/menu/icon-menu-invoice';
import IconMenuMailbox from '@/components/icon/menu/icon-menu-mailbox';
import IconMenuUsers from '@/components/icon/menu/icon-menu-users';
import IconUsersGroup from '@/components/icon/icon-users-group';
import IconNotes from '@faComponents/icon/icon-notes';
import IconNotesEdit from '@faComponents/icon/icon-notes-edit';

export type UserRole = 'student' | 'tutor' | 'admin';

type MenuLink = {
  type: 'link';
  label: string;                 // eticheta afișată
  href: string;                  // href relativ (fără /edu etc.) sau absolut (http)
  icon?: React.ComponentType<any>;
  exact?: boolean;
};

type MenuGroup = {
  type: 'group';
  label: string;                 // titlul secțiunii
};

type MenuCollapse = {
  type: 'collapse';
  label: string;
  icon?: React.ComponentType<any>;
  items: MenuLink[];
};

export type MenuItem = MenuLink | MenuGroup | MenuCollapse;

export type RoleMenus = {
  basePath: '/edu' | '/tutore' | '/admin';
  items: MenuItem[];
};

export const SIDEBAR_MENUS: Record<UserRole, RoleMenus> = {
  // ==== STUDENT ====
  student: {
    basePath: '/edu',
    items: [
      // DASHBOARD (Panou principal) - activ pe /edu
      {
        type: 'link',
        label: 'Panou principal',
        href: '/', // va deveni /edu
        icon: IconMenuDashboard,
        exact: true,
      },

      // Titlu secțiune EDU
      { type: 'group', label: 'EDU' },

      // Materiale
      {
        type: 'link',
        label: 'Materiale',
        href: '/materiale', // => /edu/materiale
        icon: IconMenuDatatables,
      },

      // Titlu secțiune PROFIL STUDENT
      { type: 'group', label: 'PROFIL STUDENT' },

      // Datele mele
      {
        type: 'link',
        label: 'Datele mele',
        href: '/datele-mele', // => /edu/datele-mele
        icon: IconMenuUsers,
      },
      // Documentele mele
      {
        type: 'link',
        label: 'Documentele mele',
        href: '/documentele-mele', // => /edu/documentele-mele
        icon: IconMenuPages,
      },
      // Contul meu
      {
        type: 'link',
        label: 'Contul meu',
        href: '/contul-meu', // => /edu/contul-meu
        icon: IconMenuAuthentication,
      },
    ],
  },

  // ==== TUTOR (placeholder hardcodat, de completat ulterior) ====
  tutor: {
    basePath: '/tutore',
    items: [
      {
        type: 'link',
        label: 'Panou principal',
        href: '/',
        icon: IconMenuDashboard,
      },
      { type: 'group', label: 'TUTORE' },
      {
        type: 'link',
        label: 'Sesiuni',
        href: '/sesiuni',
        icon: IconMenuChat,
      },
      {
        type: 'link',
        label: 'Facturare',
        href: '/facturare',
        icon: IconMenuInvoice,
      },
      { type: 'group', label: 'SUPORT' },
      {
        type: 'link',
        label: 'Documentație',
        href: 'https://vristo.sbthemes.com',
        icon: IconMenuDocumentation,
      },
    ],
  },

  // ==== ADMIN (placeholder hardcodat, de completat ulterior) ====
  admin: {
    basePath: '/admin',
    items: [
      {
        type: 'link',
        label: 'Panou principal',
        href: '/',
        icon: IconMenuDashboard,
        exact: true
      },
      { type: 'group', label: 'STUDENTI' },
      {
        type: 'link',
        label: 'Cereri in asteptare',
        href: '/cereri-in-asteptare',
        icon: IconMenuMailbox,
      },
      {
        type: 'link',
        label: 'Studenti inscrisi',
        href: '/studenti-inscrisi',
        icon: IconMenuUsers,
      },
      {
        type: 'link',
        label: 'Serii studenti',
        href: '/serii-studenti',
        icon: IconUsersGroup,
      },
      { type: 'group', label: 'MATERIALE' },
      { type: 'link',
        label: 'Lista materiale',
        href: '/materiale',
        icon: IconMenuDatatables,
      },
      { type: 'group', label: 'ARTICOLE' },
      {
        type: 'link',
        label: 'Lista articole',
        href: '/articole',
        icon: IconNotes,
      },
      {
        type: 'link',
        label: 'Adauga articol',
        href: '/adauga-articol',
        icon: IconNotesEdit,
      },

    ],
  },
};
