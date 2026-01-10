const { normalizeText, cleanText } = require('./utils');
const { DEFAULT_WORDS, DEFAULT_ADS } = require('./defaults');

class Filter {
   /**
    * @param {Object} options
    * @param {string[]} [options.words=[]] - Custom list of bad words.
    * @param {string[]} [options.ads=[]] - Custom list of ad domains/keywords.
    * @param {boolean} [options.cleanCheck=true] - Whether to check cleaned text (e.g. "s.a.l.a.k").
    * @param {boolean} [options.useDefaults=true] - Whether to use built-in English & Turkish blocklists.
    */
   constructor(options = {}) {
      this.cleanCheck = options.cleanCheck !== undefined ? options.cleanCheck : true;
      const useDefaults = options.useDefaults !== undefined ? options.useDefaults : true;

      const initialWords = options.words || [];
      const initialAds = options.ads || [];

      this.words = useDefaults ? [...DEFAULT_WORDS, ...initialWords] : initialWords;
      this.ads = useDefaults ? [...DEFAULT_ADS, ...initialAds] : initialAds;
   }

   /**
    * Adds a word to the blocklist.
    * @param {string} word
    */
   addWord(word) {
      if (!this.words.includes(word)) this.words.push(word);
   }

   /**
    * Remove a word from the blocklist.
    * @param {string} word
    */
   removeWord(word) {
      this.words = this.words.filter((w) => w !== word);
   }

   /**
    * Checks a message content for bad words or ads.
    * @param {string} content
    * @returns {Object} Result object { match: boolean, type: 'profanity' | 'ad' | null, word: string | null }
    */
   check(content) {
      if (!content) return { match: false, type: null, word: null };

      const normalized = normalizeText(content);
      const cleaned = this.cleanCheck ? cleanText(normalized) : normalized;

      // Check for profanity
      for (const word of this.words) {
         const normalizedWord = normalizeText(word);
         // Check exact inclusion or regex if implemented later
         // Using existing logic improved: check in normalized and cleaned
         if (normalized.includes(normalizedWord) || (this.cleanCheck && cleaned.includes(normalizedWord))) {
            return { match: true, type: 'profanity', word: word };
         }
      }

      // Check for ads
      for (const ad of this.ads) {
         const normalizedAd = normalizeText(ad);
         if (normalized.includes(normalizedAd) || (this.cleanCheck && cleaned.includes(normalizedAd))) {
            return { match: true, type: 'ad', word: ad };
         }
      }

      return { match: false, type: null, word: null };
   }
}

module.exports = Filter;
