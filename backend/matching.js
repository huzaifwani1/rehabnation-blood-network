const { QueryTypes, Op } = require('sequelize');

/**
 * Maps a recipient blood group to compatible donor blood groups.
 * A+ -> A+, A-, O+, O-
 * A- -> A-, O-
 * B+ -> B+, B-, O+, O-
 * B- -> B-, O-
 * AB+ -> All (A+, A-, B+, B-, AB+, AB-, O+, O-)
 * AB- -> AB-, A-, B-, O-
 * O+ -> O+, O-
 * O- -> O-
 */
const COMPATIBILITY_MAP = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};

/**
 * Finds eligible, compatible donors for an emergency blood request.
 * Supports:
 * - Blood group compatibility
 * - Proximity match (District / City)
 * - Health verification (Weight >= 50kg, Hb >= 12.5)
 * - Donation Cooldown (56-day whole-blood interval)
 * - Donor availability and account active checks
 *
 * @param {Object} db - Initialized models object
 * @param {Object} requestDetails - Details of the emergency request
 * @param {string} requestDetails.blood_group - Blood type required
 * @param {string} requestDetails.district - Target location district
 * @returns {Promise<Array>} List of matching Donor models
 */
async function findCompatibleDonors(db, requestDetails) {
  const { Donor, User } = db;
  const targetGroup = requestDetails.blood_group;
  const targetDistrict = requestDetails.district;

  const compatibleGroups = COMPATIBILITY_MAP[targetGroup];
  if (!compatibleGroups) {
    throw new Error(`Invalid request blood group: ${targetGroup}`);
  }

  // Calculate age limits (18 - 65)
  const today = new Date();
  const maxDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const minDob = new Date(today.getFullYear() - 65, today.getMonth(), today.getDate());

  // Cooldown threshold date (56 days ago)
  const cooldownLimit = new Date();
  cooldownLimit.setDate(cooldownLimit.getDate() - 56);

  // Retrieve matching active and eligible donors
  return await Donor.findAll({
    where: {
      blood_group: {
        [Op.in]: compatibleGroups,
      },
      is_available: true,
      is_flagged: false,
      date_of_birth: {
        [Op.between]: [minDob, maxDob],
      },
      weight_kg: {
        [Op.gte]: 50.0,
      },
      hemoglobin_level: {
        [Op.gte]: 12.5,
      },
      [Op.or]: [
        { last_donation_date: null },
        { last_donation_date: { [Op.lte]: cooldownLimit } },
      ],
      [Op.or]: [
        { district: targetDistrict },
        { current_city_district: targetDistrict },
      ],
    },
    include: [
      {
        model: User,
        as: 'user',
        where: { is_active: true },
        attributes: [], // Exclude credentials for matching list
      },
    ],
    order: [
      // Prioritize verified donors first
      [
        db.sequelize.literal("CASE WHEN verification_status = 'camp_verified' THEN 1 ELSE 2 END"),
        'ASC',
      ],
      // Then prioritize those who have not donated recently
      ['last_donation_date', 'ASC NULLS FIRST'],
    ],
  });
}

/**
 * Optimized SQL Stored Procedure Matching Wrapper
 */
async function findCompatibleDonorsViaProc(sequelize, requestDetails) {
  const query = `
    SELECT * FROM find_compatible_donors(
      :bloodGroup::blood_group, 
      :district
    );
  `;

  return await sequelize.query(query, {
    replacements: {
      bloodGroup: requestDetails.blood_group,
      district: requestDetails.district,
    },
    type: QueryTypes.SELECT,
  });
}

module.exports = {
  findCompatibleDonors,
  findCompatibleDonorsViaProc,
  COMPATIBILITY_MAP,
};
