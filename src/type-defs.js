/**
 * TYPE DECLARATIONS
 */

/**
 * @typedef {object} Project
 * @property {string} id - ID of the project
 */

/**
 * @typedef {object} Story
 * @property {boolean} completed - Whether the story is completed
 * @property {?string} completed_at - String representation of the time of
 * completion
 * @property {number} estimate - Story point estimate
 * @property {string} name - Name of the story
 * @property {Array<string>} owner_ids - Member IDs of members assigned to the
 * story
 */

/**
 * @typedef {object} BasicMember - Basic (not modified/enhanced by us) member object
 * fetched from Clubhouse
 * @property {object} profile - Profile of the member containing personal info
 * @property {string} profile.name - Name of the member
 */

/**
 * @typedef {object} Member - BasicMember that we have enhanced with additional
 * attributes (i.e. points)
 * @property {number} points - Total story points completed by the member
 * @property {object} profile - Profile of the member containing personal info
 * @property {string} profile.name - Name of the member
 */

/**
 * @typedef {object} MemberDisplay - Sub-object of BasicMember, with simplified structure
 * @property {string} workspace - Name of the member's workspace
 * @property {name} name - Name of the member
 * @property {string} icon - URL of the member's display icon
 */

/**
 * @typedef {object} TopContributor - Sub-object of Member, with simplified structure
 * @property {string} name - Name of the topContributor (member)
 * @property {string} points - Total story points completed by the member
 */

/**
 * @typedef {object} MemberInfo - Member object, containing workspace info (but less
 * member info than BasicMember), fetched from Clubhouse
 * @property {string} name - Name of the member
 * @property {object} workspace2 - Info about the member's workspace
 * @property {string} workspace2.url_slug - Member's workspace URL slug
 */

/**
 * @typedef {object} Progress
 * @property {number} total - Number of total story points
 */
