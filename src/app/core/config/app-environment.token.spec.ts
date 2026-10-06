import { describe, expect, it } from 'vitest';

import { AppEnvironment } from '../../../environments/environment.model';
import { validateAppEnvironment } from './app-environment.token';

describe('validateAppEnvironment', () => {
  it('accepts a root-relative API base URL', () => {
    const value: AppEnvironment = { production: true, apiBaseUrl: ' /api ' };

    expect(validateAppEnvironment(value)).toEqual({
      production: true,
      apiBaseUrl: '/api',
    });
  });

  it('accepts HTTPS for an absolute production API URL', () => {
    const value: AppEnvironment = {
      production: true,
      apiBaseUrl: 'https://api.example.com',
    };

    expect(validateAppEnvironment(value).apiBaseUrl).toBe('https://api.example.com');
  });

  it('rejects insecure absolute production API URLs', () => {
    const value: AppEnvironment = {
      production: true,
      apiBaseUrl: 'http://api.example.com',
    };

    expect(() => validateAppEnvironment(value)).toThrow(/must use HTTPS/);
  });

  it('rejects empty API configuration', () => {
    const value: AppEnvironment = { production: false, apiBaseUrl: '   ' };

    expect(() => validateAppEnvironment(value)).toThrow(/apiBaseUrl is required/);
  });
});
