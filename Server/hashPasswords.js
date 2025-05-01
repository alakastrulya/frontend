const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(`New hashed password for "${password}":`, hashedPassword);
}

hashPassword('moderator2025');