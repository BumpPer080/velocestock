import bcrypt from 'bcrypt';
import { query, getConnection } from './db.js';

const SALT_ROUNDS = 10;

const mapRowToUser = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapRowToUserWithPassword = (row) => {
  if (!row) return null;
  return {
    ...mapRowToUser(row),
    passwordHash: row.password_hash,
  };
};

export const listUsers = async () => {
  const rows = await query(
    `SELECT id, username, display_name, role, created_at, updated_at
     FROM users
     ORDER BY username`,
  );
  return rows.map(mapRowToUser);
};

export const findUserById = async (id) => {
  const rows = await query(
    `SELECT id, username, display_name, role, created_at, updated_at
     FROM users
     WHERE id = ?`,
    [id],
  );
  return mapRowToUser(rows[0]);
};

export const findUserWithPasswordByUsername = async (username) => {
  const rows = await query(
    `SELECT id, username, display_name, role, password_hash, created_at, updated_at
     FROM users
     WHERE username = ?`,
    [username],
  );
  return mapRowToUserWithPassword(rows[0]);
};

export const createUser = async ({
  username,
  password,
  displayName,
  role = 'staff',
}) => {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO users
        (username, password_hash, display_name, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [username, passwordHash, displayName ?? null, role],
    );

    const [rows] = await connection.execute(
      `SELECT id, username, display_name, role, created_at, updated_at
       FROM users
       WHERE id = ?`,
      [result.insertId],
    );

    await connection.commit();
    return mapRowToUser(rows[0]);
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      error.status = 409;
      error.message = 'Username already exists';
    }
    throw error;
  } finally {
    connection.release();
  }
};

export const updateUser = async (id, updates = {}) => {
  const fields = [];
  const params = [];

  if (updates.username) {
    fields.push('username = ?');
    params.push(updates.username);
  }

  if (updates.displayName !== undefined) {
    fields.push('display_name = ?');
    params.push(updates.displayName ?? null);
  }

  if (updates.role) {
    fields.push('role = ?');
    params.push(updates.role);
  }

  if (updates.password) {
    const passwordHash = await bcrypt.hash(updates.password, SALT_ROUNDS);
    fields.push('password_hash = ?');
    params.push(passwordHash);
  }

  if (!fields.length) {
    return findUserById(id);
  }

  params.push(id);

  try {
    await query(
      `UPDATE users
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = ?`,
      params,
    );
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      error.status = 409;
      error.message = 'Username already exists';
    }
    throw error;
  }

  return findUserById(id);
};

export const deleteUser = async (id) => {
  await query('DELETE FROM users WHERE id = ?', [id]);
};

export const recordLogin = async ({
  userId,
  ipAddress,
  userAgent,
}) => {
  await query(
    `INSERT INTO login_logs (user_id, ip_address, user_agent, logged_in_at)
     VALUES (?, ?, ?, NOW())`,
    [userId, ipAddress ?? null, userAgent ?? null],
  );
};
