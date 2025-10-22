import express from 'express';
import {
  listUsers,
  findUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../models/userModel.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      username,
      password,
      displayName,
      role,
    } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: 'Username and password are required' });
      return;
    }

    const user = await createUser({
      username,
      password,
      displayName,
      role,
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await findUserById(req.params.id);
    if (!existing) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    await deleteUser(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;

