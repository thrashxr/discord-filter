/**
 * Normalizes text by converting to lowercase and removing accents.
 * @param {string} text
 * @returns {string}
 */
const normalizeText = (text) => {
   return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
};

/**
 * Removes repeated characters from a string (e.g., "saaaalaak" -> "salak").
 * @param {string} text
 * @returns {string}
 */
const cleanText = (text) => {
   // Only remove if character repeats 3 or more times (e.g. "saaalak" -> "salak")
   // Double letters like "book" should remain "book"
   return text.replace(/(.)\1{2,}/g, '$1');
};

module.exports = {
   normalizeText,
   cleanText,
};
