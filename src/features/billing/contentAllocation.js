import { modules, lessons, exercises, challenges, projects, interviewQuestions, references, cheatSheets } from '../../content/registry.js';
import { requiredPlanForContent } from './access.js';

// Pricing reads the same registry and access decisions as content routes.
export const CONTENT_ALLOCATION = Object.freeze(Object.fromEntries(
  Object.entries({ module: modules, lesson: lessons, exercise: exercises, challenge: challenges, project: projects, interview: interviewQuestions, reference: references, cheatsheet: cheatSheets })
    .map(([kind, items]) => {
      const free = items.filter(({ id }) => requiredPlanForContent(kind, id) === 'free').length;
      return [kind, Object.freeze({ free, pro: items.length - free, total: items.length })];
    }),
));
