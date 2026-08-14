const { getCachedSettings } = require('../services/settingsService');

/**
 * Blocks all non-admin, non-auth traffic with a 503 when maintenanceMode is enabled.
 * Admin routes and the login/logout/me endpoints stay open so an admin can always get in.
 */
const checkMaintenanceMode = async (req, res, next) => {
  const allowedPrefixes = ['/api/health', '/api/admin', '/api/auth/login', '/api/auth/logout', '/api/auth/me'];
  if (allowedPrefixes.some((prefix) => req.originalUrl.startsWith(prefix))) {
    return next();
  }

  try {
    const settings = await getCachedSettings();
    if (settings.maintenanceMode) {
      return res.status(503).json({
        success: false,
        message: settings.announcementMessage || 'The app is temporarily down for maintenance. Please check back soon.',
        maintenanceMode: true,
      });
    }
    next();
  } catch (err) {
    // If the settings lookup itself fails, fail open rather than taking the whole app down.
    next();
  }
};

module.exports = checkMaintenanceMode;
