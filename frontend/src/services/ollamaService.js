/**
 * Service to connect to local Ollama instance or fallback to smart mock simulation in the browser.
 */

/**
 * Sends chat message to Ollama with browser-based smart simulation fallback
 * 
 * @param {string} systemPrompt - Generated system prompt
 * @param {string} userMessage - Incoming user message
 * @param {Object} styleAnalysis - Selected clone style analysis metrics
 * @param {Array<Object>} messagePairs - Selected clone training pairs
 * @param {Object} settings - Active user system configurations (host, model, temp, tokens)
 * @returns {Promise<string>} Generated text reply
 */
export const generateReply = async (systemPrompt, userMessage, styleAnalysis, messagePairs, settings) => {
  const host = settings?.ollamaHost || 'http://localhost:11434';
  const model = settings?.ollamaModel || 'llama3.2';
  const temperature = settings?.temperature !== undefined ? settings.temperature : 0.7;
  const maxTokens = settings?.maxTokens !== undefined ? settings.maxTokens : 100;

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout

    const response = await fetch(`${host}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        options: {
          temperature: temperature,
          num_predict: maxTokens
        },
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.message && data.message.content) {
      return data.message.content.trim();
    }
    throw new Error('Malformed reply structure');
  } catch (error) {
    console.log(`⚠️ Client-side Ollama connection skipped (${error.message}). Using local style simulator...`);
    return generateMockReply(userMessage, styleAnalysis, messagePairs);
  }
};

/**
 * Simulates a text reply in the browser using the clone's text profile and message history
 */
function generateMockReply(userMessage, styleAnalysis, messagePairs) {
  const cleanMsg = userMessage.toLowerCase().trim();

  let bestMatch = null;
  let maxMatchedWords = 0;

  const inputWords = cleanMsg.split(/\s+/).filter(w => w.length > 2);

  for (const pair of messagePairs) {
    const incomingLower = pair.incoming.toLowerCase();

    if (incomingLower === cleanMsg) {
      return pair.reply;
    }

    let matchCount = 0;
    inputWords.forEach(word => {
      if (incomingLower.includes(word)) {
        matchCount++;
      }
    });

    if (matchCount > maxMatchedWords) {
      maxMatchedWords = matchCount;
      bestMatch = pair.reply;
    }
  }

  if (bestMatch && maxMatchedWords > 0) {
    return bestMatch;
  }

  const slangs = styleAnalysis.topSlangs.map(s => s.text);
  const emojis = styleAnalysis.emojiCloud.map(e => e.text);

  const greetingWords = ['hey', 'hello', 'hi', 'sup', 'yo', 'bro', 'bhai', 'hola'];
  const isGreeting = greetingWords.some(g => cleanMsg.startsWith(g));

  let reply = '';

  if (isGreeting) {
    const greetingSlang = slangs.includes('bro') ? 'bro' : (slangs.includes('bhai') ? 'bhai' : (slangs[0] || ''));
    const greetingEmoji = emojis[0] || '👋';
    const greetings = [
      `sup ${greetingSlang}`.trim(),
      `yo ${greetingSlang}`.trim(),
      `hey`,
      `haan ${greetingSlang}`.trim()
    ];
    reply = greetings[Math.floor(Math.random() * greetings.length)] + ` ${greetingEmoji}`;
  } else {
    const primarySlang = slangs[Math.floor(Math.random() * Math.min(slangs.length, 5))] || 'lol';
    const secondarySlang = slangs[Math.floor(Math.random() * Math.min(slangs.length, 8))] || 'fr';
    const primaryEmoji = emojis[Math.floor(Math.random() * Math.min(emojis.length, 5))] || '😂';

    const patterns = [
      `yeah ${primarySlang}`,
      `${primarySlang} ${secondarySlang} ${primaryEmoji}`,
      `wait what ${primarySlang} ${primaryEmoji}`,
      `idk ${primarySlang} ${primaryEmoji}`,
      `sahi h ${primaryEmoji}`,
      `haan ${primarySlang} ${primaryEmoji}`,
      `${primarySlang} fr`
    ];

    reply = patterns[Math.floor(Math.random() * patterns.length)];
  }

  if (styleAnalysis.capitalizationStyle === 'Mostly Lowercase') {
    reply = reply.toLowerCase();
  } else if (styleAnalysis.capitalizationStyle === 'Highly Energetic (Uppercase)') {
    reply = reply.toUpperCase();
  }

  if (styleAnalysis.punctuationStyle === 'Minimalist (No Punctuation)') {
    reply = reply.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
  }

  return reply;
}
