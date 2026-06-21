const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DonationHistory = sequelize.define('DonationHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    donor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'donors',
        key: 'id',
      },
    },
    request_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'emergency_requests',
        key: 'id',
      },
    },
    hospital_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'hospitals',
        key: 'id',
      },
    },
    donation_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    weight_at_donation: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    hb_at_donation: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'donation_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return DonationHistory;
};
