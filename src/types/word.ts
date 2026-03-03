export type WordPair = {
  id: string;
  word: string;
  translation: string;
  createdAt: number;
  score: number; // 0..100
};
  
export type Stats = {
  totalWords: number;
  weekWords: number;
  streak: number;
  lastVisitDate: string;
};