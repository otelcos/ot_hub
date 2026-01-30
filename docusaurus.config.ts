import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Open Telco',
  tagline: 'A collection of telco evals for the next generation of connectivity.',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  // Custom domain deployment config
  url: 'https://opentelco.io',
  baseUrl: '/',

  organizationName: 'otelcos',
  projectName: 'website',
  trailingSlash: false,

  // Password protection for demo site
  customFields: {
    sitePassword: 'opentelco2025',
  },

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Static directories - serve leaderboard data from tabs/leaderboard
  staticDirectories: ['static', 'tabs/leaderboard'],

  // Multi-instance docs plugins for tab-based organization
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'research',
        path: 'tabs/research/docs',
        routeBasePath: '',
        sidebarPath: false,
      },
    ],
    // Leaderboard now uses custom React page at src/pages/leaderboard.tsx
    // Markdown docs moved to /leaderboard/details for reference
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'leaderboard',
        path: 'tabs/leaderboard/docs',
        routeBasePath: 'leaderboard/details',
        sidebarPath: false,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'resources',
        path: 'tabs/resources/docs',
        routeBasePath: 'resources',
        sidebarPath: false,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'blog',
        path: 'tabs/blog/docs',
        routeBasePath: 'blog',
        sidebarPath: false,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'tabs/user-guide/docs',
          sidebarPath: './sidebars.ts',
          routeBasePath: '/docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Open Telco',
      logo: {
        alt: 'GSMA Logo',
        src: 'img/GSMA.jpeg',
        height: 28,
      },
      items: [
        {
          type: 'dropdown',
          label: 'Research',
          position: 'left',
          items: [
            {
              to: '/dashboards',
              label: 'Dashboard',
            },
            {
              to: '/benchmarks',
              label: 'Benchmarks',
            },
            {
              to: '/models',
              label: 'Models',
            },
          ],
        },
        {
          to: '/leaderboard',
          label: 'Leaderboard',
          position: 'left',
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 3,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
