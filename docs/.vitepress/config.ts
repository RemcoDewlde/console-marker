import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'console-marker',
  description: 'High-performance terminal string styling for Node.js 20+',
  base: '/console-marker/',
  lang: 'en-US',

  head: [
    ['link', { rel: 'icon', href: '/console-marker/favicon.svg', type: 'image/svg+xml' }],
  ],

  themeConfig: {
    logo: { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h18v2H3v-2zm0 4h12v2H3v-2z"/></svg>' },

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'Benchmarks', link: '/benchmarks' },
      {
        text: '0.1.0',
        items: [
          { text: 'Changelog', link: 'https://github.com/RemcoDewlde/console-marker/releases' },
          { text: 'npm', link: 'https://www.npmjs.com/package/console-marker' },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Why console-marker?', link: '/guide/why' },
        ],
      },
      {
        text: 'Guide',
        items: [
          { text: 'Chaining styles', link: '/guide/chaining' },
          { text: 'Dynamic colors', link: '/guide/dynamic-colors' },
          { text: 'Tagged templates', link: '/guide/template-literals' },
          { text: 'Color levels', link: '/guide/color-levels' },
          { text: 'Named imports', link: '/guide/named-imports' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'API', link: '/api/' },
          { text: 'Benchmarks', link: '/benchmarks' },
          { text: 'Differences from chalk', link: '/guide/chalk-diff' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/RemcoDewlde/console-marker' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/console-marker' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 RemcoDewlde',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/RemcoDewlde/console-marker/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
});
