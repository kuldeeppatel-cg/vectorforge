import { buildLlamaPrompt } from './promptService.js';
import { sendChatPrompt } from './ollamaService.js';
import { getWritingStyleProfile } from './analyzerService.js';

/**
 * Service to orchestrate the entire Digital Clone reply generation pipeline with hyperparameter tuning
 * @param {string} filename - Stored chat log file name
 * @param {string} newIncomingMessage - New incoming message content
 * @returns {Promise<string>} Simulated reply content
 */
export const generateAIReply = async (filename, newIncomingMessage) => {
  // 1. Resolve formality profile score to determine dynamic tuning options
  const profile = await getWritingStyleProfile(filename);
  const score = profile.formalityScore ?? 50;

  // Hyperparameter configurations: Casual models receive higher creativity (temperature/presence_penalty)
  let temperature = 0.7;
  let presence_penalty = 0.2;
  const top_p = 0.9;

  if (score < 40) {
    temperature = 0.85;
    presence_penalty = 0.6; // Promote emoji varieties and casual spelling slang
  } else if (score >= 75) {
    temperature = 0.45;
    presence_penalty = 0.0; // Enforce rigid, predictable sentence patterns
  }

  const options = { temperature, presence_penalty, top_p };

  // 2. Build the customized system prompt and few-shot matches
  const promptData = await buildLlamaPrompt(filename, newIncomingMessage);

  // 3. Dispatch tuned prompt payload array to Ollama API
  const reply = await sendChatPrompt(promptData.messages, options);

  return reply;
};
