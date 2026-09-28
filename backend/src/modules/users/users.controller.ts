import type { Request, Response } from 'express';
import * as usersService from './users.service';

/** GET /api/users (OWNER only) */
export async function list(_req: Request, res: Response): Promise<void> {
  const users = await usersService.listUsers();
  res.json({ success: true, data: { users } });
}
