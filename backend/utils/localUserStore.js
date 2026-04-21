const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDirectory = path.join(__dirname, '..', 'data');
const usersFile = path.join(dataDirectory, 'users.json');

const ensureUsersFile = () => {
  fs.mkdirSync(dataDirectory, { recursive: true });

  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, '[]', 'utf8');
  }
};

const readUsers = () => {
  ensureUsersFile();

  try {
    return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  } catch {
    fs.writeFileSync(usersFile, '[]', 'utf8');
    return [];
  }
};

const writeUsers = (users) => {
  ensureUsersFile();
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const toPublicLocalUser = (user) => {
  if (!user) {
    return null;
  }

  const { passwordHash, ...publicUser } = user;
  return publicUser;
};

const findLocalUserByEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);
  return readUsers().find((user) => user.email === normalizedEmail) || null;
};

const findLocalUserById = (id) => {
  return readUsers().find((user) => user._id === id) || null;
};

const createLocalUser = async ({ name, email, password, phone, address }) => {
  const users = readUsers();
  const normalizedEmail = normalizeEmail(email);

  if (users.some((user) => user.email === normalizedEmail)) {
    return null;
  }

  const timestamp = new Date().toISOString();
  const user = {
    _id: `local-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'citizen',
    phone: phone?.trim() || '',
    address: address || {},
    department: '',
    avatar: '',
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastLogin: timestamp,
  };

  users.push(user);
  writeUsers(users);

  return user;
};

const verifyLocalUserCredentials = async ({ email, password }) => {
  const user = findLocalUserByEmail(email);

  if (!user || !user.isActive) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  return isPasswordValid ? user : null;
};

const touchLocalUserLogin = (id) => {
  const users = readUsers();
  const userIndex = users.findIndex((user) => user._id === id);

  if (userIndex === -1) {
    return null;
  }

  users[userIndex] = {
    ...users[userIndex],
    lastLogin: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  writeUsers(users);

  return users[userIndex];
};

const updateLocalUser = (id, updates) => {
  const users = readUsers();
  const userIndex = users.findIndex((user) => user._id === id);

  if (userIndex === -1) {
    return null;
  }

  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeUsers(users);

  return users[userIndex];
};

const changeLocalUserPassword = async ({ id, currentPassword, newPassword }) => {
  const users = readUsers();
  const userIndex = users.findIndex((user) => user._id === id);

  if (userIndex === -1) {
    return { ok: false, reason: 'missing' };
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, users[userIndex].passwordHash);

  if (!isPasswordValid) {
    return { ok: false, reason: 'invalid-password' };
  }

  users[userIndex] = {
    ...users[userIndex],
    passwordHash: await bcrypt.hash(newPassword, 12),
    updatedAt: new Date().toISOString(),
  };
  writeUsers(users);

  return { ok: true, user: users[userIndex] };
};

module.exports = {
  createLocalUser,
  findLocalUserByEmail,
  findLocalUserById,
  verifyLocalUserCredentials,
  touchLocalUserLogin,
  updateLocalUser,
  changeLocalUserPassword,
  toPublicLocalUser,
};
