// Mock Redis implementation for testing when Redis is not available
class MockRedisClient {
  private storage = new Map<string, any>();
  private lists = new Map<string, any[]>();
  private hashes = new Map<string, Map<string, string>>();

  async ping(): Promise<string> {
    return 'PONG';
  }

  async hSet(key: string, data: Record<string, string>): Promise<number> {
    if (!this.hashes.has(key)) {
      this.hashes.set(key, new Map());
    }
    const hash = this.hashes.get(key)!;
    let count = 0;
    for (const [field, value] of Object.entries(data)) {
      if (!hash.has(field)) count++;
      hash.set(field, value);
    }
    return count;
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    const hash = this.hashes.get(key);
    if (!hash) return {};
    const result: Record<string, string> = {};
    for (const [field, value] of hash.entries()) {
      result[field] = value;
    }
    return result;
  }

  async lPush(key: string, ...values: string[]): Promise<number> {
    if (!this.lists.has(key)) {
      this.lists.set(key, []);
    }
    const list = this.lists.get(key)!;
    list.unshift(...values);
    return list.length;
  }

  async lRange(key: string, start: number, stop: number): Promise<string[]> {
    const list = this.lists.get(key) || [];
    if (stop === -1) stop = list.length - 1;
    return list.slice(start, stop + 1);
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    // Mock implementation - in real Redis this would set TTL
    return true;
  }

  async quit(): Promise<string> {
    return 'OK';
  }
}

// For testing purposes, use mock Redis implementation
console.log('⚠️  Using mock Redis implementation for testing');
const redisClient = new MockRedisClient();

export { redisClient };
