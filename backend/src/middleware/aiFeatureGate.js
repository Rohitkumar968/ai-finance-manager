const { getCachedSettings } = require('../services/settingsService');

/**
 * Blocks all /api/ai/* routes with a clean 503 when an admin has disabled
 * AI features platform-wide via System Settings.
 */
const checkAIFeatureEnabled = async (req, res, next) => {
  try {
    const settings = await getCachedSettings();
    if (!settings.aiFeaturesEnabled) {
      return res.status(503).json({
        success: false,
        message: 'AI features have been temporarily disabled by an administrator.',
      });
    }
    next();
  } catch (err) {
    // Fail open - a settings lookup failure shouldn't take down AI features entirely.
    next();
  }
};

module.exports = checkAIFeatureEnabled;
