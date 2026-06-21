const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Donor = sequelize.define('Donor', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    full_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isEligibleAge(value) {
          const dob = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
          if (age < 18 || age > 65) {
            throw new Error('Donor must be between 18 and 65 years old.');
          }
        },
      },
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    blood_group: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
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
    current_city_district: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    weight_kg: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Weight must be positive.',
        },
      },
    },
    hemoglobin_level: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Hemoglobin level must be positive.',
        },
      },
    },
    last_donation_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    total_donations: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    verification_status: {
      type: DataTypes.ENUM('unverified', 'camp_verified'),
      defaultValue: 'unverified',
      allowNull: false,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    is_flagged: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  }, {
    tableName: 'donors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Donor;
};
