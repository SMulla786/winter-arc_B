import { NextFunction, Request, Response } from 'express';

export const sanitizeString = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const clean = <T>(data: T): T => {
  if (typeof data === 'string') {
    return sanitizeString(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => clean(item)) as unknown as T;
  }
  if (data !== null && typeof data === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      sanitizedObj[key] = clean((data as Record<string, any>)[key]);
    }
    return sanitizedObj as T;
  }
  return data;
};

const xssMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) req.body = clean(req.body);
    if (req.query) req.query = clean(req.query);
    if (req.params) req.params = clean(req.params);
    next();
  };
};

export default xssMiddleware;

