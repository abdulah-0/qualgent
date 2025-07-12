import { Router, Request, Response } from 'express';
import { redisClient } from '../services/redis';
import { jobQueue } from '../services/queue';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
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

  } catch (error: any) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      version: '1.0.0'
    });
  }
});

async function checkRedisHealth(): Promise<{ status: string; latency?: number; error?: string }> {
  try {
    const start = Date.now();
    await redisClient.ping();
    const latency = Date.now() - start;
    
    return {
      status: 'healthy',
      latency
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

async function checkQueueHealth(): Promise<{ status: string; waiting?: number; active?: number; error?: string }> {
  try {
    const waiting = await jobQueue.getWaiting();
    const active = await jobQueue.getActive();
    
    return {
      status: 'healthy',
      waiting: waiting.length,
      active: active.length
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

export { router as healthRoutes };
