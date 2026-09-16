import request from 'supertest';
import app from '../../src/app';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';

jest.mock('../../src/client', () => ({
    __esModule: true,
    default: {
        event: {
            findMany: jest.fn().mockResolvedValue([]),
            count: jest.fn().mockResolvedValue(0),
            findUnique: jest.fn().mockResolvedValue(null),
        },
        cateror: {
            findUnique: jest.fn().mockResolvedValue({
                id: 'cat-123',
                languageId: 'lang-123',
            }),
            findFirst: jest.fn().mockResolvedValue(null),
        },
        user: {
            findUnique: jest.fn().mockResolvedValue({
                id: 'usr-123',
                caterorId: 'cat-123',
                role: 'CATEROR',
            }),
        },
        subEvent: {
            findMany: jest.fn().mockResolvedValue([]),
        },
    },
}));

describe('Event API Integration Tests (Supertest)', () => {
    let token: string;

    beforeAll(() => {
        token = jwt.sign(
            {id: 'usr-123', caterorId: 'cat-123', role: 'CATEROR'},
            process.env.JWT_SECRET || 'test_secret_key_1234567890',
            {expiresIn: '1h'},
        );
    });

    describe('GET /api/v1/cateror/events', () => {
        it('should require authentication token or cateror query params', async () => {
            const response = await request(app).get('/api/v1/cateror/events');
            expect(response.status).toBeGreaterThanOrEqual(httpStatus.BAD_REQUEST);
        });

        it('should return 200 OK with event list when valid token is supplied', async () => {
            const response = await request(app)
                .get('/api/v1/cateror/events?languageId=lang-123')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toHaveProperty('data');
            expect(response.body.message).toBeDefined();
        });
    });

    describe('POST /api/v1/cateror/events', () => {
        it('should return error response when request body fails Zod validation', async () => {
            const response = await request(app)
                .post('/api/v1/cateror/events')
                .set('Authorization', `Bearer ${token}`)
                .send({}); // Missing required fields

            expect(response.status).toBeGreaterThanOrEqual(httpStatus.BAD_REQUEST);
        });
    });
});
