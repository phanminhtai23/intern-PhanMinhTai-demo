import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
  workspace_id: z.number(),
});

export const LoginSchema = z.object({
  user_id: z.string(), // từ Logto
});
