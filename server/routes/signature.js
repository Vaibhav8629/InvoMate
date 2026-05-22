const express    = require('express');
const router     = express.Router();
const User       = require('../models/Register');
const { cloudinary, upload } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth-middleware'); // your existing auth middleware
const checkSubscription = require('../middleware/subscription-middleware');

// Upload or replace signature
router.post('/upload', authMiddleware, checkSubscription, upload.single('signature'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Delete old signature from Cloudinary if exists
    if (user.signature?.public_id) {
      await cloudinary.uploader.destroy(user.signature.public_id);
    }

    // Save new URL to MongoDB
    user.signature = {
      url:       req.file.path,
      public_id: req.file.filename,
    };
    await user.save();

    res.status(200).json({ message: 'Signature saved.', signature: user.signature });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current signature
router.get('/', authMiddleware, checkSubscription, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('signature');
    res.status(200).json({ signature: user.signature });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete signature
router.delete('/', authMiddleware, checkSubscription, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.signature?.public_id) {
      await cloudinary.uploader.destroy(user.signature.public_id);
    }
    user.signature = { url: null, public_id: null };
    await user.save();
    res.status(200).json({ message: 'Signature removed.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;