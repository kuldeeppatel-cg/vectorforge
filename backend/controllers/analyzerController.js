import { getWritingStyleProfile } from '../services/analyzerService.js';

/**
 * Controller to trigger style analysis calculations and return JSON profile metadata
 */
export const handleGetStyleProfile = async (req, res, next) => {
  try {
    const { filename } = req.query;

    if (!filename) {
      const error = new Error('Query parameter "filename" is required.');
      error.statusCode = 400;
      throw error;
    }

    const profile = await getWritingStyleProfile(filename);

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
};
