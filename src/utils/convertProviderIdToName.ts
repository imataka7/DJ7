type SupportedProvider = 'Twitter' | 'Google';

export default function convertProviderToName(id: string): SupportedProvider {
  switch (id) {
    case 'google.com':
      return 'Google';
    case 'twitter.com':
      return 'Twitter';
    default:
      throw new Error(`Given provider id is not supported: ${id}`);
  }
}
