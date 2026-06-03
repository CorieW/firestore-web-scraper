import { defineConfig } from 'vitepress'

const base = process.env.VITEPRESS_BASE ?? '/'

export default defineConfig({
  title: 'Firestore Web Scraper',
  description: 'Firebase Functions package for processing Firestore-backed web scraping tasks.',
  base,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: `${base}brand/icon.png` }],
    ['meta', { name: 'theme-color', content: '#f59e0b' }],
  ],
  themeConfig: {
    logo: '/brand/icon.png',
    siteTitle: 'Firestore Web Scraper',
    search: {
      provider: 'local',
    },
    nav: [
      { text: 'Setup', link: '/setup.html' },
      { text: 'Configuration', link: '/configuration.html' },
      { text: 'Tasks', link: '/firestore-tasks.html' },
      { text: 'Types', link: '/types/query-types.html' },
    ],
    sidebar: [
      {
        text: 'Get Started',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Setup', link: '/setup.html' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Configuration', link: '/configuration.html' },
          { text: 'Firestore Tasks', link: '/firestore-tasks.html' },
        ],
      },
      {
        text: 'Types',
        items: [
          { text: 'Query Types', link: '/types/query-types.html' },
          { text: 'Extraction Targets', link: '/types/targets.html' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/CorieW/scraper-firebase-extension' },
    ],
    footer: {
      message: 'Released under the Apache-2.0 License.',
      copyright: 'Copyright (c) Corie Watson',
    },
  },
})
