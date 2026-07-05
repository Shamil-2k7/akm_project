const Settings = require('../models/Settings');

// @desc    Get all settings (formatted as key-value object)
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res, next) => {
  try {
    const settingsList = await Settings.find();
    
    // Convert array of models to a simple key-value object
    const settingsObj = {};
    settingsList.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    // Provide defaults if database is empty
    const defaults = {
      allowRegistration: true,
      maxSessionsPerStudent: 2,
      maintenanceMode: false,
      platformName: 'AKM Academy',
    };

    const finalSettings = { ...defaults, ...settingsObj };
    res.json(finalSettings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update or create settings (Admin only)
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body; // Expects an object of { key: value }

    if (!updates || typeof updates !== 'object') {
      res.status(400);
      throw new Error('Invalid request payload. Expected an object.');
    }

    const savedSettings = {};

    for (const [key, value] of Object.entries(updates)) {
      const setting = await Settings.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
      savedSettings[setting.key] = setting.value;
    }

    res.json({
      message: 'Settings updated successfully',
      settings: savedSettings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
