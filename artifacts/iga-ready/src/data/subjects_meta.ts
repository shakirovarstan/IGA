import { Subject } from '../types';

export const SUBJECTS: { id: Subject; title: { ru: string; ky: string }; color: string; gradient: string; emoji: string }[] = [
  { id: 'algebra',  title: { ru: 'Алгебра',        ky: 'Алгебра'       }, color: 'bg-blue-600',   gradient: 'linear-gradient(135deg, #1cb0f6 0%, #0088cc 100%)', emoji: '📐' },
  { id: 'geometry', title: { ru: 'Геометрия',      ky: 'Геометрия'     }, color: 'bg-violet-600', gradient: 'linear-gradient(135deg, #f18e00 0%, #cc7700 100%)', emoji: '📏' },
  { id: 'russian',  title: { ru: 'Русский язык',   ky: 'Орус тили'     }, color: 'bg-teal-600',   gradient: 'linear-gradient(135deg, #ba1a1a 0%, #8c1010 100%)', emoji: '📖' },
  { id: 'kyrgyz',   title: { ru: 'Кыргызский язык',ky: 'Кыргыз тили'  }, color: 'bg-green-600',  gradient: 'linear-gradient(135deg, #2b6c00 0%, #1a4200 100%)', emoji: '🌐' },
];
