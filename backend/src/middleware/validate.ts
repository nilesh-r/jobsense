import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          issues: (error as any).errors.map((err: any) => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(500).json({ error: 'Internal validation server error' });
    }
  };
};
