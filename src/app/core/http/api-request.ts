import { AppEnvironment } from '../../../environments/environment.model';

export function isApiRequest(url: string, environment: AppEnvironment): boolean {
  const baseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  if (/^https?:\/\//i.test(baseUrl)) {
    return url === baseUrl || url.startsWith(`${baseUrl}/`);
  }

  const normalizedBase = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;
  return url === normalizedBase || url.startsWith(`${normalizedBase}/`);
}
