declare class MockQueue {
    private jobs;
    private jobCounter;
    add(name: string, data: any, options?: any): Promise<{
        id: string;
    }>;
    getWaiting(): Promise<any[]>;
    getActive(): Promise<any[]>;
    private processJob;
}
export declare const jobQueue: MockQueue;
export {};
//# sourceMappingURL=queue.d.ts.map