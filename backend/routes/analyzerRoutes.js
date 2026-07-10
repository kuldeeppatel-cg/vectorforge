import express from 'express';
import { handleGetStyleProfile } from '../controllers/analyzerController.js';

const router = express.Router();

/**
 * @route   GET /api/style-profile
 * @desc    Get the writing style profile analysis of the selected owner
 * @access  Public
 */
router.get('/style-profile', handleGetStyleProfile);

export default router;
