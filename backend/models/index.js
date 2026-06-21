const { Sequelize } = require('sequelize');

const initModels = (sequelize) => {
  const User = require('./User')(sequelize);
  const Donor = require('./Donor')(sequelize);
  const Hospital = require('./Hospital')(sequelize);
  const Admin = require('./Admin')(sequelize);
  const EmergencyRequest = require('./EmergencyRequest')(sequelize);
  const RequestDonorMatch = require('./RequestDonorMatch')(sequelize);
  const Notification = require('./Notification')(sequelize);
  const DonationHistory = require('./DonationHistory')(sequelize);

  // --- Associations ---

  // User 1:1 profiles
  User.hasOne(Donor, { foreignKey: 'user_id', as: 'donorProfile' });
  Donor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  User.hasOne(Hospital, { foreignKey: 'user_id', as: 'hospitalProfile' });
  Hospital.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  User.hasOne(Admin, { foreignKey: 'user_id', as: 'adminProfile' });
  Admin.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Notifications
  User.hasMany(Notification, { foreignKey: 'recipient_id', as: 'notifications' });
  Notification.belongsTo(User, { foreignKey: 'recipient_id', as: 'recipient' });

  // Emergency Requests
  Hospital.hasMany(EmergencyRequest, { foreignKey: 'hospital_id', as: 'requests' });
  EmergencyRequest.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });

  User.hasMany(EmergencyRequest, { foreignKey: 'created_by', as: 'createdRequests' });
  EmergencyRequest.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  // Many-to-Many matching logic (Request <-> Donor via RequestDonorMatch)
  EmergencyRequest.hasMany(RequestDonorMatch, { foreignKey: 'request_id', as: 'matches' });
  RequestDonorMatch.belongsTo(EmergencyRequest, { foreignKey: 'request_id', as: 'request' });

  Donor.hasMany(RequestDonorMatch, { foreignKey: 'donor_id', as: 'matches' });
  RequestDonorMatch.belongsTo(Donor, { foreignKey: 'donor_id', as: 'donor' });

  // Donation History associations
  Donor.hasMany(DonationHistory, { foreignKey: 'donor_id', as: 'donations' });
  DonationHistory.belongsTo(Donor, { foreignKey: 'donor_id', as: 'donor' });

  EmergencyRequest.hasOne(DonationHistory, { foreignKey: 'request_id', as: 'history' });
  DonationHistory.belongsTo(EmergencyRequest, { foreignKey: 'request_id', as: 'request' });

  Hospital.hasMany(DonationHistory, { foreignKey: 'hospital_id', as: 'receivedDonations' });
  DonationHistory.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });

  return {
    sequelize,
    User,
    Donor,
    Hospital,
    Admin,
    EmergencyRequest,
    RequestDonorMatch,
    Notification,
    DonationHistory,
  };
};

module.exports = initModels;
