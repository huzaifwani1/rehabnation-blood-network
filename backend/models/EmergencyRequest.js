const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EmergencyRequest = sequelize.define('EmergencyRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    hospital_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'hospitals',
        key: 'id',
      },
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    blood_group: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      allowNull: false,
    },
    units_needed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    units_fulfilled: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        isWithinNeeded(value) {
          if (value > this.units_needed) {
            throw new Error('Units fulfilled cannot exceed units needed.');
          }
        },
      },
    },
    urgency: {
      type: DataTypes.ENUM('critical', 'urgent', 'standard'),
      defaultValue: 'standard',
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('open', 'fulfilled', 'expired', 'cancelled'),
      defaultValue: 'open',
      allowNull: false,
    },
    expiry_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'emergency_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return EmergencyRequest;
};
