import { Request, Response, NextFunction } from 'express';
interface CustomError extends Error {
    statusCode?: number;
    status?: string;
}
export declare function errorHandler(error: CustomError, req: Request, res: Response, next: NextFunction): void;
export {};
//# sourceMappingURL=errorHandler.d.ts.map