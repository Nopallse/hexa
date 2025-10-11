import { useSettingsStore } from '@/store/settingsStore';
import { translations } from '@/locales/translations';

// Helper function to get nested object value by path
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Helper function to replace placeholders in strings
function replacePlaceholders(text: string, params: Record<string, any> = {}): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });
}

export function useTranslation() {
  const { language } = useSettingsStore();
  
  const t = (key: string, params?: Record<string, any>): string => {
    // Get the language object (id or en)
    const languageObj = translations[language.toLowerCase() as keyof typeof translations] || translations.id;
    
    // Get the translation value
    const translation = getNestedValue(languageObj, key);
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key; // Return the key if translation is missing
    }
    
    if (typeof translation === 'string') {
      return replacePlaceholders(translation, params);
    }
    
    return String(translation);
  };
  
  return {
    t,
    language,
  };
}
