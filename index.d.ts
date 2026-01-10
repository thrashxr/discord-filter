export interface FilterOptions {
   words?: string[];
   ads?: string[];
   cleanCheck?: boolean;
   useDefaults?: boolean;
}

export interface FilterResult {
   match: boolean;
   type: 'profanity' | 'ad' | null;
   word: string | null;
}

export class Filter {
   constructor(options?: FilterOptions);
   words: string[];
   ads: string[];
   cleanCheck: boolean;

   addWord(word: string): void;
   removeWord(word: string): void;
   check(content: string): FilterResult;
}
