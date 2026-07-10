const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'but', 'or', 'to', 'for', 'with', 'in', 'on', 'at', 'by', 'of', 'from', 
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 
  'its', 'our', 'their', 'this', 'that', 'these', 'those', 'as', 'if', 'so', 'just', 'like', 'then', 
  'up', 'down', 'out', 'off', 'about', 'get', 'go', 'can', 'will', 'would', 'should', 'could', 
  'some', 'any', 'no', 'not', 'that\'s', 'it\'s', 'im', 'i\'m', 'whats', 'what\'s', 'here', 'there', 
  'who', 'what', 'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 
  'other', 'some', 'such', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 
  'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 
  'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 
  'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 
  'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"
]);

/**
 * Analyzes texting habits of a target sender in the browser
 */
export const analyzeSenderStyle = (messages, targetSender) => {
  const senderMessages = messages.filter(msg => msg.sender === targetSender);
  
  if (senderMessages.length === 0) {
    return {
      messageCount: 0,
      averageLength: 0,
      averageWords: 0,
      emojiCloud: [],
      topSlangs: [],
      capitalizationStyle: 'Standard',
      punctuationStyle: 'Standard',
      messageLengthDistribution: { short: 0, medium: 0, long: 0 },
      splitMessageHabit: 'Low',
      activityByHour: Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 })),
      summary: 'No message history available.'
    };
  }

  const messageCount = senderMessages.length;
  let totalCharacters = 0;
  let totalWords = 0;

  const emojiCounts = {};
  const wordCounts = {};
  const hourCounts = Array(24).fill(0);
  
  let lowercaseCount = 0;
  let uppercaseCount = 0;
  let standardCaseCount = 0;

  let minimalPunctuationCount = 0;
  let expressivePunctuationCount = 0;
  let standardPunctuationCount = 0;

  let shortCount = 0;
  let mediumCount = 0;
  let longCount = 0;

  let consecutiveMultiTexts = 0;

  // Modern JS emoji matching via unicode properties
  const emojiRegex = /\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?/gu;

  senderMessages.forEach((msg, idx) => {
    const text = msg.content || '';
    totalCharacters += text.length;
    
    const words = text.toLowerCase().replace(/[^\w\s']/g, ' ').split(/\s+/).filter(Boolean);
    totalWords += words.length;

    if (words.length < 5) shortCount++;
    else if (words.length <= 15) mediumCount++;
    else longCount++;

    // Emoji check
    const emojis = text.match(emojiRegex) || [];
    emojis.forEach(emoji => {
      // Exclude digits/hash that match emoji property
      if (!/^[0-9#*]$/.test(emoji)) {
        emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
      }
    });

    // Vocabulary check
    words.forEach(word => {
      if (!STOPWORDS.has(word) && isNaN(word) && word.length > 1) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });

    // Casing check
    const isAllLowercase = text === text.toLowerCase();
    const isAllUppercase = text === text.toUpperCase() && /[A-Z]/.test(text);

    if (isAllLowercase) {
      lowercaseCount++;
    } else if (isAllUppercase) {
      uppercaseCount++;
    } else {
      standardCaseCount++;
    }

    // Punctuation check
    const hasPunctuation = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g.test(text);
    const hasExpressivePunctuation = /!!|\?\?|\.\.\./g.test(text);

    if (!hasPunctuation) {
      minimalPunctuationCount++;
    } else if (hasExpressivePunctuation) {
      expressivePunctuationCount++;
    } else {
      standardPunctuationCount++;
    }

    // Hour extract
    if (msg.timeStr) {
      let hour = 12;
      const parts = msg.timeStr.match(/(\d+):(\d+)(?::\d+)?\s*([AaPp][Mm])?/);
      if (parts) {
        hour = parseInt(parts[1], 10);
        const ampm = parts[3];
        if (ampm) {
          if (ampm.toLowerCase() === 'pm' && hour < 12) hour += 12;
          if (ampm.toLowerCase() === 'am' && hour === 12) hour = 0;
        }
      }
      hourCounts[hour]++;
    }

    // Text splitting
    if (idx > 0) {
      const prevMsg = senderMessages[idx - 1];
      if (msg.timeStr === prevMsg.timeStr || msg.dateStr === prevMsg.dateStr && Math.abs(idx) < 5) {
        consecutiveMultiTexts++;
      }
    }
  });

  const emojiCloud = Object.entries(emojiCounts)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const topSlangs = Object.entries(wordCounts)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12);

  // Capitalization style
  let capitalizationStyle = 'Standard Casing';
  if (lowercaseCount / messageCount > 0.7) {
    capitalizationStyle = 'Mostly Lowercase';
  } else if (uppercaseCount / messageCount > 0.3) {
    capitalizationStyle = 'Highly Energetic (Uppercase)';
  }

  // Punctuation style
  let punctuationStyle = 'Standard Punctuation';
  if (minimalPunctuationCount / messageCount > 0.6) {
    punctuationStyle = 'Minimalist (No Punctuation)';
  } else if (expressivePunctuationCount / messageCount > 0.25) {
    punctuationStyle = 'Expressive (!!, ..., ??)';
  }

  // Message split
  let splitMessageHabit = 'Low';
  const splitRatio = consecutiveMultiTexts / messageCount;
  if (splitRatio > 0.4) {
    splitMessageHabit = 'High (Sends text in fragments)';
  } else if (splitRatio > 0.2) {
    splitMessageHabit = 'Medium';
  }

  // Activity by hour mapped to chart structure
  const activityByHour = hourCounts.map((count, hour) => {
    let label = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
    return { hour, label, count };
  });

  // Dynamic summary
  let summary = `${targetSender} texts in `;
  if (shortCount / messageCount > 0.6) {
    summary += 'short, swift sentences ';
  } else if (longCount / messageCount > 0.4) {
    summary += 'lengthy sentences ';
  } else {
    summary += 'balanced mid-length texts ';
  }

  summary += `using ${capitalizationStyle.toLowerCase()} styling. `;

  if (emojiCloud.length > 0) {
    summary += `They often add emojis like ${emojiCloud.slice(0, 3).map(e => e.text).join(' ')}. `;
  }

  if (topSlangs.length > 0) {
    summary += `Key slang words include: "${topSlangs.slice(0, 3).map(s => s.text).join('", "')}".`;
  }

  return {
    messageCount,
    averageLength: Math.round(totalCharacters / messageCount),
    averageWords: Math.round(totalWords / messageCount),
    emojiCloud,
    topSlangs,
    capitalizationStyle,
    punctuationStyle,
    messageLengthDistribution: {
      short: Math.round((shortCount / messageCount) * 100),
      medium: Math.round((mediumCount / messageCount) * 100),
      long: Math.round((longCount / messageCount) * 100),
    },
    splitMessageHabit,
    activityByHour,
    summary
  };
};
