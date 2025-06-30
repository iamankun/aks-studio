import {
  getRedirectUrl,
  unstable_getResponseFromNextConfig,
} from 'next/experimental/testing/server';
import nextConfig from './next.config.js';

describe('next.config.js', () => {
  // Test for a simple temporary redirect
  it('should handle temporary redirects correctly', async () => {
    const configWithRedirects = {
      ...nextConfig,
      async redirects() {
        return [{ source: '/old-path', destination: '/new-path', permanent: false }];
      },
    };

    const response = await unstable_getResponseFromNextConfig({
      url: 'https://example.com/old-path',
      nextConfig: configWithRedirects,
    });

    expect(response.status).toEqual(307); // Temporary Redirect
    expect(getRedirectUrl(response)).toEqual('https://example.com/new-path');
  });

  // Test for a permanent redirect
  it('should handle permanent redirects', async () => {
    const configWithRedirects = {
      ...nextConfig,
      async redirects() {
        return [{ source: '/legacy', destination: '/modern', permanent: true }];
      },
    };

    const response = await unstable_getResponseFromNextConfig({
      url: 'https://example.com/legacy',
      nextConfig: configWithRedirects,
    });

    expect(response.status).toEqual(308); // Permanent Redirect
    expect(getRedirectUrl(response)).toEqual('https://example.com/modern');
  });

  // Test for a rewrite
  it('should handle rewrites correctly', async () => {
    const configWithRewrites = {
      ...nextConfig,
      async rewrites() {
        return {
          beforeFiles: [
            { source: '/about-us', destination: '/about' },
          ],
          afterFiles: [],
          fallback: [],
        }
      },
    };

    const response = await unstable_getResponseFromNextConfig({
      url: 'https://example.com/about-us',
      nextConfig: configWithRewrites,
    });

    // For a rewrite, the status is 200, and the rewrite URL is in a header.
    expect(response.status).toEqual(200);
    const rewriteUrl = new URL(response.headers.get('x-middleware-rewrite'));
    expect(rewriteUrl.pathname).toEqual('/about');
  });

  // Test for custom headers
  it('should apply custom headers correctly', async () => {
    const configWithHeaders = {
      ...nextConfig,
      async headers() {
        return [
          {
            source: '/(.*)',
            headers: [
              { key: 'x-custom-header', value: 'my-custom-value' },
            ],
          },
        ];
      },
    };

    const response = await unstable_getResponseFromNextConfig({
      url: 'https://example.com/any-path',
      nextConfig: configWithHeaders,
    });

    expect(response.status).toEqual(200);
    expect(response.headers.get('x-custom-header')).toEqual('my-custom-value');
  });
});