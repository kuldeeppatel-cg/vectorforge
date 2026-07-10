/**
 * Writing Style Analyzer Utility
 * Deterministic text analyzer evaluating sentence lengths, formatting behaviors,
 * punctuation profiles, slang counts, vocabulary, and emoji frequencies.
 */

const stopwords = new Set([
  "the", "a", "an", "and", "but", "or", "for", "nor", "on", "in", "at", "to", "by", 
  "of", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", 
  "do", "does", "did", "this", "that", "these", "those", "i", "you", "he", "she", 
  "it", "we", "they", "me", "him", "her", "us", "them", "my", "your", "his", "its", 
  "our", "their", "am", "with", "as", "if", "about", "there", "then", "so", 
  "than", "just", "very", "up", "out", "now", "get", "go", "can", "will", "here"
]);

const greetingsList = ["hey", "hi", "hello", "yo", "wassup", "sup", "morning", "gm", "hola"];
const goodbyesList = ["bye", "goodnight", "gn", "see ya", "later", "talk later", "ttyl", "cya", "adios"];
const slangList = ["lol", "lmao", "rofl", "idk", "btw", "wanna", "gonna", "gotta", "literally", "bro", "bruh", "fr", "tbh", "lmfao"];

// Regex for extracting standard emojis
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu;

/**
 * Deterministically analyzes messages to generate a JSON style profile
 * @param {Array<string>} messages - List of raw message texts sent by the target user
 * @returns {Object} Style profile statistics
 */
export const analyzeStyle = (messages) => {
  if (!messages || messages.length === 0) {
    return {
      avgReplyLength: 0,
      mostCommonWords: [],
      mostCommonEmojis: [],
      greetingStyle: "None detected",
      goodbyeStyle: "None detected",
      formalityLevel: "Casual",
      formalityScore: 50,
      slang: [],
      emojiFrequency: "0.0%",
      punctuationHabits: {
        endingPeriods: 0,
        endingExclamations: 0,
        endingQuestions: 0,
        noPunctuation: 100
      },
      typicalSentenceLength: 0
    };
  }

  let totalWords = 0;
  let totalCharacters = 0;
  let wordFrequencies = {};
  let emojiFrequencies = {};
  let messagesWithEmoji = 0;
  
  let detectedGreetings = {};
  let detectedGoodbyes = {};
  let detectedSlang = {};
  
  let endingPeriodsCount = 0;
  let endingExclamationsCount = 0;
  let endingQuestionsCount = 0;
  let noPunctuationCount = 0;
  let doublePunctuationCount = 0;

  let totalSentences = 0;
  let capitalizationCount = 0;
  let alphabeticStartCount = 0;

  messages.forEach((msg) => {
    const text = msg.message ? msg.message.trim() : '';
    if (!text) return;

    // 1. Word tokenization and counts
    const words = text.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-zA-Z0-9']/g, '')).filter(Boolean);
    totalWords += words.length;
    
    words.forEach(w => {
      totalCharacters += w.length;
      if (!stopwords.has(w)) {
        wordFrequencies[w] = (wordFrequencies[w] || 0) + 1;
      }
      
      // Slang frequency audit
      if (slangList.includes(w)) {
        detectedSlang[w] = (detectedSlang[w] || 0) + 1;
      }
    });

    // 2. Sentence segmentation
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    totalSentences += sentences.length;

    // 3. Emojis extraction
    const emojis = text.match(emojiRegex);
    if (emojis) {
      messagesWithEmoji++;
      emojis.forEach(e => {
        emojiFrequencies[e] = (emojiFrequencies[e] || 0) + 1;
      });
    }

    // 4. Greeting identification (inspecting first word)
    if (words.length > 0) {
      const firstWord = words[0];
      if (greetingsList.includes(firstWord)) {
        detectedGreetings[firstWord] = (detectedGreetings[firstWord] || 0) + 1;
      }
    }

    // 5. Goodbye identification (inspecting last word)
    if (words.length > 0) {
      const lastWord = words[words.length - 1];
      if (goodbyesList.includes(lastWord)) {
        detectedGoodbyes[lastWord] = (detectedGoodbyes[lastWord] || 0) + 1;
      }
    }

    // 6. Capitalization habits (did first word start with capital letter?)
    const matchCapital = text.match(/^[A-Z]/);
    const matchLetter = text.match(/^[a-zA-Z]/);
    if (matchLetter) {
      alphabeticStartCount++;
      if (matchCapital) {
        capitalizationCount++;
      }
    }

    // 7. Ending punctuation patterns
    const lastChar = text[text.length - 1];
    if (lastChar === '.') {
      endingPeriodsCount++;
    } else if (lastChar === '!') {
      endingExclamationsCount++;
    } else if (lastChar === '?') {
      endingQuestionsCount++;
    } else if (/[a-zA-Z0-9]/.test(lastChar) || !lastChar) {
      noPunctuationCount++;
    } else {
      // Catch other characters or nested punctuation
      noPunctuationCount++;
    }

    // Double punctuation checks (e.g., !!, ??)
    if (/!!|\?\?/g.test(text)) {
      doublePunctuationCount++;
    }
  });

  const totalMsgs = messages.length;

  // 8. Sorting and filtering top frequencies
  const topWords = Object.entries(wordFrequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(entry => entry[0]);

  const topEmojis = Object.entries(emojiFrequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);

  const topGreeting = Object.entries(detectedGreetings)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "None detected";

  const topGoodbye = Object.entries(detectedGoodbyes)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "None detected";

  const activeSlang = Object.keys(detectedSlang);

  // 9. Formality index scoring calculations (base 50 points)
  let formalityScore = 50;

  // Capitalization weight
  if (alphabeticStartCount > 0) {
    const capRate = capitalizationCount / alphabeticStartCount;
    formalityScore += (capRate >= 0.7) ? 15 : (capRate < 0.2) ? -15 : 0;
  } else {
    formalityScore -= 10;
  }

  // Punctuation weight
  const periodRate = endingPeriodsCount / totalMsgs;
  const noPuncRate = noPunctuationCount / totalMsgs;
  formalityScore += (periodRate >= 0.5) ? 15 : 0;
  formalityScore += (noPuncRate >= 0.6) ? -15 : 0;
  formalityScore += (doublePunctuationCount > 0) ? -5 : 0;

  // Word complexity weight
  if (totalWords > 0) {
    const avgCharSize = totalCharacters / totalWords;
    formalityScore += (avgCharSize >= 4.5) ? 10 : (avgCharSize < 3.8) ? -10 : 0;
  }

  // Slang occurrence penalty
  const slangRatio = Object.values(detectedSlang).reduce((a, b) => a + b, 0) / totalMsgs;
  formalityScore -= Math.min(slangRatio * 15, 20);

  // Boundaries capping
  formalityScore = Math.max(0, Math.min(100, Math.round(formalityScore)));

  // Map score to description
  let formalityLevel = "Casual";
  if (formalityScore >= 85) formalityLevel = "Formal";
  else if (formalityScore >= 60) formalityLevel = "Semi-Formal";
  else if (formalityScore < 30) formalityLevel = "Very Casual";

  return {
    avgReplyLength: Math.round((totalWords / totalMsgs) * 10) / 10,
    mostCommonWords: topWords,
    mostCommonEmojis: topEmojis,
    greetingStyle: topGreeting,
    goodbyeStyle: topGoodbye,
    formalityLevel,
    formalityScore,
    slang: activeSlang,
    emojiFrequency: `${((messagesWithEmoji / totalMsgs) * 100).toFixed(1)}%`,
    punctuationHabits: {
      endingPeriods: Math.round((endingPeriodsCount / totalMsgs) * 100),
      endingExclamations: Math.round((endingExclamationsCount / totalMsgs) * 100),
      endingQuestions: Math.round((endingQuestionsCount / totalMsgs) * 100),
      noPunctuation: Math.round((noPunctuationCount / totalMsgs) * 100)
    },
    typicalSentenceLength: totalSentences > 0 ? Math.round((totalWords / totalSentences) * 10) / 10 : 0
  };
};
