import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const CACHE_DIR = path.join(ROOT_DIR, 'data', 'cache');

// Ensure base directories are created
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Validates a filename string to protect against Directory Traversal and LFI attacks.
 * @param {string} filename - Raw input filename string
 * @returns {string} Sanitized flat basename
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') {
    const error = new Error('Validation Error: A valid filename string is required.');
    error.statusCode = 400;
    throw error;
  }

  // Block path delimiters to prevent traversal escapes
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    const error = new Error('Security Alert: Traversal paths (.., /, \\) are prohibited.');
    error.statusCode = 400;
    throw error;
  }

  const cleanName = path.basename(filename);

  // Validate extension formats
  const ext = path.extname(cleanName).toLowerCase();
  if (ext !== '.txt' && ext !== '.json') {
    const error = new Error('Validation Error: Allowed extensions are restricted to .txt or .json.');
    error.statusCode = 400;
    throw error;
  }

  return cleanName;
};

/**
 * Returns a verified absolute path inside the uploads/ directory
 * @param {string} filename - Target filename
 * @returns {string} Safe absolute path
 */
export const getSafeUploadPath = (filename) => {
  const name = sanitizeFilename(filename);
  return path.join(UPLOADS_DIR, name);
};

/**
 * Returns a verified absolute path inside the data/cache/ directory
 * @param {string} filename - Target filename
 * @returns {string} Safe absolute path
 */
export const getSafeCachePath = (filename) => {
  const name = sanitizeFilename(filename);
  const jsonName = name.endsWith('.txt') ? `${name.slice(0, -4)}.json` : name;
  return path.join(CACHE_DIR, jsonName);
};
