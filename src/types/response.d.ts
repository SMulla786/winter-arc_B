import {Role} from '@prisma/client';
export interface TokenResponse {
    token: string;
    expires: Date;
}

export interface AuthTokensResponse {
    access: TokenResponse;
    refresh?: TokenResponse;
}

export type UserProfile = {
    id: string;
    username: string;
    email: string;
    fullname: string;
    role: Role;
    marketerId?: string;
    phoneNumber: string;
    // address?: string;
};
