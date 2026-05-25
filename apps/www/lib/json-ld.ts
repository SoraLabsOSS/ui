export const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://ui.soralabs.io.vn/#website',
      url: 'https://ui.soralabs.io.vn',
      name: 'Sora UI',
      description:
        'Fully animated, open-source component distribution built with React, TypeScript, Tailwind CSS, Motion and Shadcn CLI. Browse a list of components you can install, modify, and use in your projects.',
      inLanguage: 'en',
      publisher: {
        '@id': 'https://ui.soralabs.io.vn/#organization',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://ui.soralabs.io.vn/#organization',
      name: 'Sora UI',
      url: 'https://ui.soralabs.io.vn',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ui.soralabs.io.vn/icon-logo.png',
        width: 512,
        height: 512,
      },
    },
  ],
};
