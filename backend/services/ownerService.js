import fs from 'fs/promises';
import path from 'path';
import { parseUploadedFile } from './parserService.js';
import { sanitizeFilename } from '../utils/security.js';

const SELECTIONS_FILE = './data/selections.json';

// Helper to read selections from local flat database
const readSelections = async () => {
  try {
    const data = await fs.readFile(SELECTIONS_FILE, 'utf-8');
    return JSON.parse(data || '{}');
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(path.dirname(SELECTIONS_FILE), { recursive: true });
      await fs.writeFile(SELECTIONS_FILE, '{}', 'utf-8');
      return {};
    }
    throw err;
  }
};

// Helper to write selections atomically to prevent database corruption
const writeSelections = async (selections) => {
  const tempPath = `${SELECTIONS_FILE}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(selections, null, 2), 'utf-8');
  await fs.rename(tempPath, SELECTIONS_FILE);
};

/**
 * Extracts unique participants from parsed chat messages
 * @param {string} filename - Stored chat log file name
 * @returns {Promise<Array<string>>} Distinct participants list
 */
export const getChatParticipants = async (filename) => {
  const name = sanitizeFilename(filename);
  const messages = await parseUploadedFile(name);
  const participants = [...new Set(messages.map((m) => m.sender))];
  return participants;
};

/**
 * Validates and stores the owner selection for a chat log file atomically
 * @param {string} filename - Stored chat log file name
 * @param {string} ownerName - Selected participant acting as "Me"
 * @returns {Promise<string>} The selected owner name
 */
export const saveChatOwner = async (filename, ownerName) => {
  const name = sanitizeFilename(filename);
  const participants = await getChatParticipants(name);

  if (!participants.includes(ownerName)) {
    const error = new Error(
      `Owner validation failed: "${ownerName}" is not a participant in this chat. Available participants: ${participants.join(', ')}`
    );
    error.statusCode = 400;
    throw error;
  }

  const selections = await readSelections();
  selections[name] = ownerName;
  await writeSelections(selections);

  return ownerName;
};

/**
 * Retrieves the owner selection mapping for a chat log file
 * @param {string} filename - Stored chat log file name
 * @returns {Promise<string|null>} The owner name, or null if unregistered
 */
export const getChatOwner = async (filename) => {
  const name = sanitizeFilename(filename);
  const selections = await readSelections();
  return selections[name] || null;
};
