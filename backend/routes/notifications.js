const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// GET /api/notifications/admin-stats
router.get('/admin-stats', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const total = await Notification.countDocuments({});
    const read = await Notification.countDocuments({ is_read: true });
    const unread = await Notification.countDocuments({ is_read: false });
    
    const byType = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const statsByType = {};
    byType.forEach(item => {
      statsByType[item._id || 'general'] = item.count;
    });

    return res.json({
      total,
      read,
      unread,
      statsByType
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/notifications
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ created_at: -1 });
    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticateJWT, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { $set: { is_read: true } },
      { new: true }
    );
    if (!notif) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    return res.json(notif);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticateJWT, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, is_read: false },
      { $set: { is_read: true } }
    );
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
