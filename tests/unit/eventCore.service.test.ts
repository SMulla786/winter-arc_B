import eventCoreService from '../../src/services/caterors/event/eventCore.service';
import prisma from '../../src/client';
import httpStatus from 'http-status';
import {ApiError} from '../../src/utils';

jest.mock('../../src/client', () => ({
    __esModule: true,
    default: {
        event: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        subEvent: {
            findMany: jest.fn(),
        },
    },
}));

describe('EventCoreService Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getEventById', () => {
        it('should return event details if event exists', async () => {
            const mockEvent = {
                id: 'evt-123',
                name: 'Wedding Banquet',
                caterorId: 'cat-456',
                startDate: new Date(),
                endDate: new Date(),
                subEvents: [],
            };

            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

            const result = await eventCoreService.getEventById('evt-123', 'cat-456');

            expect(prisma.event.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {id: 'evt-123', caterorId: 'cat-456'},
                }),
            );
            expect(result).toEqual(mockEvent);
        });

        it('should throw 404 ApiError if event is not found', async () => {
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(eventCoreService.getEventById('invalid-id', 'cat-456')).rejects.toThrow(
                ApiError,
            );
            await expect(eventCoreService.getEventById('invalid-id', 'cat-456')).rejects.toHaveProperty(
                'statusCode',
                httpStatus.NOT_FOUND,
            );
        });
    });

    describe('pinEvent', () => {
        it('should toggle event pinned status', async () => {
            const mockEvent = {id: 'evt-123', pinned: false};
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
            (prisma.event.update as jest.Mock).mockResolvedValue({...mockEvent, pinned: true});

            const result = await eventCoreService.pinEvent('evt-123', true);

            expect(prisma.event.update).toHaveBeenCalledWith({
                where: {id: 'evt-123'},
                data: {pinned: true},
            });
            expect(result.pinned).toBe(true);
        });
    });
});
