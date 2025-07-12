"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
// Mock Redis implementation for testing when Redis is not available
class MockRedisClient {
    constructor() {
        this.storage = new Map();
        this.lists = new Map();
        this.hashes = new Map();
    }
    async ping() {
        return 'PONG';
    }
    async hSet(key, data) {
        if (!this.hashes.has(key)) {
            this.hashes.set(key, new Map());
        }
        const hash = this.hashes.get(key);
        let count = 0;
        for (const [field, value] of Object.entries(data)) {
            if (!hash.has(field))
                count++;
            hash.set(field, value);
        }
        return count;
    }
    async hGetAll(key) {
        const hash = this.hashes.get(key);
        if (!hash)
            return {};
        const result = {};
        for (const [field, value] of hash.entries()) {
            result[field] = value;
        }
        return result;
    }
    async lPush(key, ...values) {
        if (!this.lists.has(key)) {
            this.lists.set(key, []);
        }
        const list = this.lists.get(key);
        list.unshift(...values);
        return list.length;
    }
    async lRange(key, start, stop) {
        const list = this.lists.get(key) || [];
        if (stop === -1)
            stop = list.length - 1;
        return list.slice(start, stop + 1);
    }
    async expire(key, seconds) {
        // Mock implementation - in real Redis this would set TTL
        return true;
    }
    async quit() {
        return 'OK';
    }
}
// For testing purposes, use mock Redis implementation
console.log('⚠️  Using mock Redis implementation for testing');
const redisClient = new MockRedisClient();
exports.redisClient = redisClient;
//# sourceMappingURL=redis.js.map