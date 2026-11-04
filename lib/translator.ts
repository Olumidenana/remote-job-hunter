import { TranslationData } from '@/types/job';

interface LanguagePattern {
  lang: string;
  code: string;
  pattern: RegExp;
  greeting: (company: string) => string;
  dictionary: Record<string, string>;
}

const LANGUAGES: LanguagePattern[] = [
  {
    lang: 'German (Deutsch)',
    code: 'de',
    pattern: /\b(wir suchen|vollzeit|entwickler|aufgaben|anforderungen|kenntnisse|ab sofort|standort|unser team|gehalt|deutschland)\b/i,
    greeting: (company) => `Sehr geehrtes Team bei ${company},`,
    dictionary: {
      'wir suchen': 'we are looking for',
      'vollzeit': 'full-time',
      'entwickler': 'developer',
      'aufgaben': 'key responsibilities',
      'anforderungen': 'requirements',
      'kenntnisse': 'skills',
      'ab sofort': 'immediately',
      'standort': 'location',
      'unser team': 'our team',
      'remote': 'remote',
    },
  },
  {
    lang: 'French (Français)',
    code: 'fr',
    pattern: /\b(nous recherchons|télétravail|développeur|missions|compétences|profil recherché|expérience|équipe)\b/i,
    greeting: (company) => `Bonjour l'équipe de ${company},`,
    dictionary: {
      'nous recherchons': 'we are looking for',
      'télétravail': 'remote work',
      'développeur': 'developer',
      'missions': 'responsibilities',
      'compétences': 'skills',
      'expérience': 'experience',
    },
  },
  {
    lang: 'Spanish (Español)',
    code: 'es',
    pattern: /\b(buscamos|remoto|desarrollador|requisitos|experiencia|funciones|nuestro equipo)\b/i,
    greeting: (company) => `Hola equipo de ${company},`,
    dictionary: {
      'buscamos': 'we are looking for',
      'remoto': 'remote',
      'desarrollador': 'developer',
      'requisitos': 'requirements',
      'experiencia': 'experience',
    },
  },
];

export function detectAndTranslateJob(title: string, description: string, company: string): TranslationData {
  const combined = `${title} ${description}`;

  for (const item of LANGUAGES) {
    if (item.pattern.test(combined)) {
      // Non-English job posting detected!
      let translatedTitle = title;
      let translatedDescription = description;

      // Replace key phrases with English equivalents for immediate comprehension
      for (const [foreign, english] of Object.entries(item.dictionary)) {
        const regex = new RegExp(`\\b${foreign}\\b`, 'gi');
        translatedTitle = translatedTitle.replace(regex, english);
        translatedDescription = translatedDescription.replace(regex, `[${english}]`);
      }

      return {
        detectedLanguage: item.lang,
        isTranslated: true,
        translatedTitle,
        translatedDescription,
        localLanguageGreeting: item.greeting(company),
      };
    }
  }

  return {
    detectedLanguage: 'English',
    isTranslated: false,
  };
}
