const SystemSetting = require('../models/SystemSetting');

let cache = { settings: null, expiresAt: 0 };
const CACHE_TTL_MS = 15000;

/**
 * Returns the current SystemSetting singleton, cached briefly in memory
 * to avoid a DB round-trip on every request.
 */
const getCachedSettings = async () => {
  if (cache.settings && Date.now() < cache.expiresAt) {
    return cache.settings;
  }
  const settings = await SystemSetting.getSingleton();
  cache = { settings, expiresAt: Date.now() + CACHE_TTL_MS };
  return settings;
};

/** Call after any settings update so subsequent requests see fresh values immediately. */
const invalidateSettingsCache = () => {
  cache = { settings: null, expiresAt: 0 };
};

module.exports = { getCachedSettings, invalidateSettingsCache };
