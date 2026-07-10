import fs from 'fs/promises';
import { parseChatLog } from '../utils/chatParser.js';
import { getSafeUploadPath, getSafeCachePath } from '../utils/security.js';
import { existsSync } from 'fs';

/**
 * Service to manage reading upload files, checking JSON caches, and writing cache outputs
 * @param {string} filename - Sanitized upload filename
 * @returns {Promise<Array<Object>>} Parsed message entries list
 */
export const parseUploadedFile = async (filename) => {
  const uploadPath = getSafeUploadPath(filename);
  const cachePath = getSafeCachePath(filename);

  try {
    // 1. Performance check: return pre-parsed JSON cache if exists
    if (existsSync(cachePath)) {
      const cachedData = await fs.readFile(cachePath, 'utf-8');
      return JSON.parse(cachedData);
    }

    // 2. Read the raw text log file
    const rawContent = await fs.readFile(uploadPath, 'utf-8');
    
    // 3. Execute parser utility
    const messages = parseChatLog(rawContent);

    // 4. Save JSON representation in cache directory for subsequent requests
    await fs.writeFile(cachePath, JSON.stringify(messages, null, 2), 'utf-8');
    
    return messages;
  } catch (err) {
    if (err.code === 'ENOENT') {
      const error = new Error(`Operational error: File "${filename}" could not be located in storage.`);
      error.statusCode = 404;
      throw error;
    }
    throw err;
  }
};
