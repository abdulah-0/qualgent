"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const express_1 = require("express");
const redis_1 = require("../services/redis");
const queue_1 = require("../services/queue");
const router = (0, express_1.Router)();
exports.healthRoutes = router;
router.get('/', async (req, res) => {
    try {
        // Check Redis connection
        const redisStatus = await checkRedisHealth();
        // Check queue status
        const queueStatus = await checkQueueHealth();
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                redis: redisStatus,
                queue: queueStatus
            },
            version: '1.0.0'
        };
        // If any service is unhealthy, mark overall status as unhealthy
        const isHealthy = redisStatus.status === 'healthy' && queueStatus.status === 'healthy';
        if (!isHealthy) {
            health.status = 'unhealthy';
            return res.status(503).json(health);
        }
        res.json(health);
    }
    catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message,
            version: '1.0.0'
        });
    }
});
async function checkRedisHealth() {
    try {
        const start = Date.now();
        await redis_1.redisClient.ping();
        const latency = Date.now() - start;
        return {
            status: 'healthy',
            latency
        };
    }
    catch (error) {
        return {
            status: 'unhealthy',
            error: error.message
        };
    }
}
async function checkQueueHealth() {
    try {
        const waiting = await queue_1.jobQueue.getWaiting();
        const active = await queue_1.jobQueue.getActive();
        return {
            status: 'healthy',
            waiting: waiting.length,
            active: active.length
        };
    }
    catch (error) {
        return {
            status: 'unhealthy',
            error: error.message
        };
    }
}
//# sourceMappingURL=health.js.map