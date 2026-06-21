const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RequestDonorMatch = sequelize.define('RequestDonorMatch', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    request_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'emergency_requests',
        key: 'id',
      },
    },
    donor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'donors',
        key: 'id',
      },
    },
    notified_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    response: {
      type: DataTypes.ENUM('pending', 'available', 'unavailable'),
      defaultValue: 'pending',
      allowNull: false,
    },
    responded_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    outcome: {
      type: DataTypes.ENUM('pending', 'donated', 'no_show', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false,
    },
    outcome_recorded_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'request_donor_matches',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['request_id', 'donor_id'],
      },
    ],
  });

  return RequestDonorMatch;
};
