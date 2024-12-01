import express from 'express';
import redis from '../config/redis';

const router = express.Router();

// // GET /api/redis/health - Basic health check
// router.get('/health', async (req, res) => {
//     try {
//         const ping = await redis.ping();
//         res.json({
//             status: 'success',
//             message: 'Redis is connected',
//             ping: ping,
//             redisStatus: redis.status
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: 'error',
//             message: 'Redis connection failed',
//             error: error.message
//         });
//     }
// });

// // POST /api/redis/test - Test set operation
// router.post('/test', async (req, res) => {
//     try {
//         const testValue = 'test_' + Date.now();
//         await redis.set('test_key', testValue);
//         const retrievedValue = await redis.get('test_key');

//         res.json({
//             status: 'success',
//             message: 'Redis write/read test successful',
//             written: testValue,
//             retrieved: retrievedValue,
//             match: testValue === retrievedValue
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: 'error',
//             message: 'Redis operation failed',
//             error: error.message
//         });
//     }
// });

// // GET /api/redis/info - Detailed Redis info
// router.get('/info', async (req, res) => {
//     try {
//         const info = await redis.info();
//         const memory = await redis.info('memory');
//         const clients = await redis.info('clients');

//         res.json({
//             status: 'success',
//             message: 'Redis info retrieved',
//             details: {
//                 status: redis.status,
//                 connectionName: redis.options.connectionName,
//                 host: redis.options.host,
//                 port: redis.options.port,
//                 databaseNumber: redis.options.db,
//                 info: info,
//                 memory: memory,
//                 clients: clients
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to retrieve Redis info',
//             error: error.message
//         });
//     }
// });

export default router;