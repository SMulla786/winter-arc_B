import type {Config} from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    moduleNameMapper: {
        '^@libs/(.*)$': '<rootDir>/src/libs/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@utils$': '<rootDir>/src/utils/index.ts',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@routes/(.*)$': '<rootDir>/src/routes/$1',
        '^@models/(.*)$': '<rootDir>/src/models/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@services$': '<rootDir>/src/services/index.ts',
        '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
        '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
        '^@validations/(.*)$': '<rootDir>/src/validations/$1',
        '^@validations$': '<rootDir>/src/validations/index.ts',
        '^@client$': '<rootDir>/src/client.ts',
    },
    testMatch: ['**/tests/**/*.test.ts'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    verbose: true,
};

export default config;
