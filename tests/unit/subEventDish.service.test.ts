import subEventDishService from '../../src/services/caterors/subEvent/subEventDish.service';
import prisma from '../../src/client';
import {ApiError} from '../../src/utils';

jest.mock('../../src/client', () => ({
    __esModule: true,
    default: {
        event: {
            findUnique: jest.fn(),
        },
        subEvent: {
            findUnique: jest.fn(),
        },
        subEventDish: {
            findMany: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
        },
        extraRawMateials: {
            create: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

describe('SubEventDishService Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addExtraRawMaterial', () => {
        it('should create extra raw material if subevent/event exists', async () => {
            (prisma.event.findUnique as jest.Mock).mockResolvedValue({id: 'evt-1'});
            (prisma.extraRawMateials.create as jest.Mock).mockResolvedValue({
                id: 'ex-1',
                quantity: 10,
                rawMaterialId: 'rm-1',
                inventory: 5,
                totalQty: 15,
                eventId: 'evt-1',
            });

            const result = await subEventDishService.addExtraRawMaterial('evt-1', {
                quantity: 10,
                rawMaterialId: 'rm-1',
                inventoryValue: 5,
                totalQty: 15,
            });

            expect(result.id).toBe('ex-1');
            expect(prisma.extraRawMateials.create).toHaveBeenCalledWith({
                data: {
                    quantity: 10,
                    rawMaterialId: 'rm-1',
                    inventory: 5,
                    totalQty: 15,
                    eventId: 'evt-1',
                },
            });
        });

        it('should throw NOT_FOUND if event does not exist', async () => {
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                subEventDishService.addExtraRawMaterial('invalid-evt', {
                    quantity: 10,
                    rawMaterialId: 'rm-1',
                    inventoryValue: 5,
                    totalQty: 15,
                }),
            ).rejects.toThrow(ApiError);
        });
    });

    describe('saveManagerMenu', () => {
        it('should update dish categories and serial numbers for manager menu', async () => {
            (prisma.subEventDish.update as jest.Mock).mockResolvedValue({});

            const mockMenuPayload: Parameters<typeof subEventDishService.saveManagerMenu>[0] = [
                {
                    subeventId: 'sub-1',
                    categories: [
                        {
                            categoryId: 'cat-1',
                            srNo: 1,
                            dishes: [{dishId: 'dish-1', srNo: 1}],
                        },
                    ],
                },
            ];

            await subEventDishService.saveManagerMenu(mockMenuPayload);

            expect(prisma.subEventDish.update).toHaveBeenCalledWith({
                where: {
                    subEventId_dishId: {
                        subEventId: 'sub-1',
                        dishId: 'dish-1',
                    },
                },
                data: {
                    srNo: 1,
                    category_srNo: 1,
                },
            });
        });
    });
});
