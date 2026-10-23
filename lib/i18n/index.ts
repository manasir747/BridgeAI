import { en, Translations } from './translations/en';
import { hi } from './translations/hi';
import { mr } from './translations/mr';
import { SupportedLanguage } from '@/types/i18n';

export * from '@/types/i18n';
export type { Translations } from './translations/en';

export const translations: Record<SupportedLanguage, Translations> = {
  en,
  hi,
  mr,
};

export function getTranslations(lang: SupportedLanguage): Translations {
  return translations[lang] || translations.en;
}

/**
 * Replaces `{paramName}` placeholders with corresponding parameter values.
 */
export function formatTemplate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }, template);
}
