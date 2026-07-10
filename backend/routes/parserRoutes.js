import express from 'express';
import { uploadConfig } from '../config/multer.js';
import { handleParseOnly, handleUploadAndParse } from '../controllers/parserController.js';

const router = express.Router();

/**
 * @route   POST /api/parse-only
 * @desc    Parse an already uploaded text file on disk
 * @access  Public
 */
router.post('/parse-only', handleParseOnly);

/**
 * @route   POST /api/upload-and-parse
 * @desc    Upload new files and parse their content immediately
 * @access  Public
 */
router.post('/upload-and-parse', uploadConfig.array('files', 10), handleUploadAndParse);

export default router;
