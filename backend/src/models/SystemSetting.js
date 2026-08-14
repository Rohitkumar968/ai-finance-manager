const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema(
  {
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowRegistrations: {
      type: Boolean,
      default: true,
    },
    aiFeaturesEnabled: {
      type: Boolean,
      default: true,
    },
    maxAIRequestsPerHourPerUser: {
      type: Number,
      default: 60,
      min: 1,
    },
    announcementMessage: {
      type: String,
      default: '',
      maxlength: 500,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

/**
 * There should only ever be one settings document. This helper fetches it,
 * creating a default one on first access.
 */
systemSettingSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
