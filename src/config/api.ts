import { GEMINI_API_KEY as ENV_KEY } from '@env';

export const GEMINI_API_KEY = typeof ENV_KEY === 'string' ? ENV_KEY : '';
