import { Request, Response, Router } from 'express';

const swaggerRouter = Router();

swaggerRouter.get('/api-docs', (req: Request, res: Response) => {
    res.type('html').send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dark Grimoire Fitness API Documentation</title>
            <style>
                body { font-family: system-ui, sans-serif; background: #070708; color: #e4e4e7; padding: 2rem; }
                h1 { color: #d51f2a; }
                code { background: #18181b; padding: 0.2rem 0.4rem; border-radius: 4px; color: #f43f5e; }
            </style>
        </head>
        <body>
            <h1>Dark Grimoire Fitness API</h1>
            <p>API is running in standard mode.</p>
            <ul>
                <li><code>POST /api/v1/auth/register</code></li>
                <li><code>POST /api/v1/auth/login</code></li>
                <li><code>GET /api/v1/auth/me</code></li>
                <li><code>GET /api/v1/meals</code></li>
                <li><code>POST /api/v1/ai/scan-food</code></li>
                <li><code>GET /api/v1/activity</code></li>
            </ul>
        </body>
        </html>
    `);
});

export default swaggerRouter;

