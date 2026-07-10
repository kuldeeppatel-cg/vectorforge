import { parseUploadedFile } from './parserService.js';
import { getChatOwner } from './ownerService.js';
import { analyzeStyle } from '../utils/styleAnalyzer.js';

/**
 * Service to retrieve owner messages and perform style analysis calculations
 * @param {string} filename - Stored chat log file name
 * @returns {Promise<Object>} Completed JSON style profile mapping
 */
export const getWritingStyleProfile = async (filename) => {
  // 1. Fetch registered owner
  const ownerName = await getChatOwner(filename);

  if (!ownerName) {
    const error = new Error(
      `No owner selected for file "${filename}". Please register which participant is "Me" to start analysis.`
    );
    error.statusCode = 400;
    throw error;
  }

  // 2. Load all parsed messages
  const messages = await parseUploadedFile(filename);

  // 3. Filter messages sent by the owner/me
  const ownerMessages = messages.filter((m) => m.sender === ownerName);

  // 4. Run style analytics utility
  const profile = analyzeStyle(ownerMessages);

  return profile;
};
