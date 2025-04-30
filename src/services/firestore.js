// Mock firestore service for development until we connect to Firebase
// This will simulate the basic functionality needed for the app

// In-memory storage for development
const users = {};
const children = {};
const chores = {};
const rewards = {};
const transactions = {};
const analytics = {};

/**
 * Create a new user profile
 * @param {string} uid - The user ID
 * @param {Object} userData - The user data to store
 * @returns {Promise<Object>} - The created user profile
 */
export const createUserProfile = async (uid, userData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Store the user data
  users[uid] = {
    ...userData,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  return users[uid];
};

/**
 * Get a user profile by ID
 * @param {string} uid - The user ID
 * @returns {Promise<Object|null>} - The user profile or null if not found
 */
export const getUserProfile = async (uid) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return users[uid] || null;
};

/**
 * Update a user profile
 * @param {string} uid - The user ID
 * @param {Object} updates - The fields to update
 * @returns {Promise<Object>} - The updated user profile
 */
export const updateUserProfile = async (uid, updates) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  if (!users[uid]) {
    throw new Error('User not found');
  }
  
  users[uid] = {
    ...users[uid],
    ...updates,
    updatedAt: Date.now(),
  };
  
  return users[uid];
};

/**
 * Create a child profile
 * @param {Object} childData - The child profile data
 * @returns {Promise<Object>} - The created child profile
 */
export const createChildProfile = async (childData) => {
  // Generate an ID if none is provided
  const id = childData.id || Math.random().toString(36).substr(2, 9);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Store the child data
  children[id] = {
    ...childData,
    id,
    points: childData.points || 0,
    streakCount: childData.streakCount || 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  return children[id];
};

/**
 * Get all children for a parent
 * @param {string} parentId - The parent's user ID
 * @returns {Promise<Array>} - Array of child profiles
 */
export const getChildrenByParent = async (parentId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return Object.values(children).filter(child => child.parentId === parentId);
};

/**
 * Create a new chore
 * @param {Object} choreData - The chore data
 * @returns {Promise<Object>} - The created chore
 */
export const createChore = async (choreData) => {
  // Generate an ID if none is provided
  const id = choreData.id || Math.random().toString(36).substr(2, 9);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Store the chore data
  chores[id] = {
    ...choreData,
    id,
    status: choreData.status || 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  return chores[id];
};

/**
 * Get all chores for a child
 * @param {string} childId - The child's ID
 * @returns {Promise<Array>} - Array of chores
 */
export const getChoresByChild = async (childId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return Object.values(chores).filter(chore => chore.assignedTo === childId);
};

/**
 * Get all chores for a parent
 * @param {string} parentId - The parent's user ID
 * @returns {Promise<Array>} - Array of chores
 */
export const getChoresByParent = async (parentId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return Object.values(chores).filter(chore => chore.createdBy === parentId);
};

/**
 * Update a chore
 * @param {string} choreId - The chore ID
 * @param {Object} updates - The fields to update
 * @returns {Promise<Object>} - The updated chore
 */
export const updateChore = async (choreId, updates) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  if (!chores[choreId]) {
    throw new Error('Chore not found');
  }
  
  chores[choreId] = {
    ...chores[choreId],
    ...updates,
    updatedAt: Date.now(),
  };
  
  return chores[choreId];
};

// Export other firestore-related functions as needed