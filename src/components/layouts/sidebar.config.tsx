// components/layouts/sidebar.config.tsx
import type React from 'react';

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
// import IconNotes from '@faComponents/icon/icon-notes';
import IconSave from '@/components/icon/icon-save';
import IconNotesEdit from '@faComponents/icon/icon-notes-edit';
import IconClipboardText from '@faComponents/icon/icon-clipboard-text';
import IconOpenBook from '@/components/icon/icon-open-book';
import IconMenuContacts from '@faComponents/icon/menu/icon-menu-contacts';
import IconUser from '@/components/icon/icon-user';

export type UserRole = 'student' | 'tutore' | 'admin';

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

  tutore: {
    basePath: '/tutore',
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
        label: 'Materiale studenti',
        href: '/materiale',
        icon: IconMenuDatatables,
      },
      { type: 'group', label: 'PROFIL' },
      {
        type: 'link',
        label: 'Contul meu',
        href: '/contul-meu',
        icon: IconMenuAuthentication,
      },
    ],
  },

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
        label: 'Materiale studenti',
        href: '/materiale',
        icon: IconMenuDatatables,
      },
      {
        type: 'link',
        label: 'Documente publice',
        href: '/documente-publice',
        icon: IconClipboardText,
      },
      { type: 'group', label: 'ARTICOLE' },
      {
        type: 'link',
        label: 'Program de practica',
        href: '/program-de-practica',
        icon: IconOpenBook,
      },
      {
        type: 'link',
        label: 'Termeni si conditii',
        href: '/termeni-si-conditii',
        icon: IconNotesEdit,
      },
      {
        type: 'link',
        label: 'Politica de confidentialitate',
        href: '/politica-de-confidentialitate',
        icon: IconSave,
      },  
      // {
      //   type: 'link',
      //   label: 'Lista articole',
      //   href: '/articole',
      //   icon: IconNotes,
      // },
      // {
      //   type: 'link',
      //   label: 'Adauga articol',
      //   href: '/adauga-articol',
      //   icon: IconNotesEdit,
      // },
      { type: 'group', label: 'UTILIZATORI' },
      {
        type: 'link',
        label: 'Utilizatori',
        href: '/utilizatori',
        icon: IconUser,
      },      
      { type: 'group', label: 'PROFIL' },
      {
        type: 'link',
        label: 'Contul meu',
        href: '/contul-meu',
        icon: IconMenuAuthentication,
      },

    ],
  },
};
