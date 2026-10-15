import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'inventory-system-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly preferenceState = signal<ThemePreference>('system');
  private readonly systemDarkState = signal(false);

  readonly preference = this.preferenceState.asReadonly();
  readonly resolvedTheme = computed<ResolvedTheme>(() => {
    const preference = this.preferenceState();

    if (preference !== 'system') {
      return preference;
    }

    return this.systemDarkState() ? 'dark' : 'light';
  });

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const storedPreference = this.readStoredPreference();

    if (storedPreference) {
      this.preferenceState.set(storedPreference);
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemDarkState.set(media.matches);

    const handleSystemThemeChange = (event: MediaQueryListEvent): void => {
      this.systemDarkState.set(event.matches);
    };

    media.addEventListener('change', handleSystemThemeChange);
    this.destroyRef.onDestroy(() => media.removeEventListener('change', handleSystemThemeChange));

    effect(() => {
      const theme = this.resolvedTheme();
      this.document.documentElement.dataset['theme'] = theme;
      this.document.documentElement.style.colorScheme = theme;
    });
  }

  toggle(): void {
    this.setPreference(this.resolvedTheme() === 'dark' ? 'light' : 'dark');
  }

  useSystem(): void {
    this.setPreference('system');
  }

  setPreference(preference: ThemePreference): void {
    this.preferenceState.set(preference);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      if (preference === 'system') {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, preference);
      }
    } catch {
      // Theme persistence is optional. The active in-memory preference still applies.
    }
  }

  private readStoredPreference(): ThemePreference | null {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);

      return value === 'light' || value === 'dark' || value === 'system'
        ? value
        : null;
    } catch {
      return null;
    }
  }
}
