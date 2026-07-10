import { parseUploadedFile } from '../services/parserService.js';

/**
 * Controller to parse an already uploaded file
 */
export const handleParseOnly = async (req, res, next) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      const error = new Error('Required payload parameter: "filename" is missing in request body.');
      error.statusCode = 400;
      throw error;
    }

    const messages = await parseUploadedFile(filename);

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to upload one or multiple files and immediately parse them
 */
export const handleUploadAndParse = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);

    if (files.length === 0) {
      const error = new Error('No files uploaded. Please attach at least one valid WhatsApp chat export (.txt).');
      error.statusCode = 400;
      throw error;
    }

    const results = {};

    // Process each uploaded file
    for (const file of files) {
      const parsedData = await parseUploadedFile(file.filename);
      results[file.originalname] = {
        filename: file.filename,
        size: `${(file.size / (1024 * 1024)).toFixed(3)} MB`,
        count: parsedData.length,
        messages: parsedData
      };
    }

    res.status(200).json({
      success: true,
      message: 'Files uploaded and parsed successfully.',
      data: results
    });
  } catch (err) {
    next(err);
  }
};
