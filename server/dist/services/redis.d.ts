declare class MockRedisClient {
    private storage;
    private lists;
    private hashes;
    ping(): Promise<string>;
    hSet(key: string, data: Record<string, string>): Promise<number>;
    hGetAll(key: string): Promise<Record<string, string>>;
    lPush(key: string, ...values: string[]): Promise<number>;
    lRange(key: string, start: number, stop: number): Promise<string[]>;
    expire(key: string, seconds: number): Promise<boolean>;
    quit(): Promise<string>;
}
declare const redisClient: MockRedisClient;
export { redisClient };
//# sourceMappingURL=redis.d.ts.map