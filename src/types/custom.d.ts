
declare namespace Express {
    export interface Request {
        cf_ip?: string,
        user?: {
            email: string,
            owner: string,
            firstName?: string,
            lastName?: string,
            profilePicThumb?: string,
            id: string,
            role: Role,
            level?: number,
            children?: string[],
        }
    }
}