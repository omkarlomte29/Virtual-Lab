import { createClient } from 'redis';

// Redis client class for better error handling and reconnection
class RedisClient {
    private client: any;
    private isConnecting = false;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private connectionAttempts = 0;
    private readonly MAX_RETRY_ATTEMPTS = 5;
    private readonly RETRY_DELAY = 5000; // 5 seconds

    constructor() {
        this.initializeClient();
        this.connect(); // Ensure connection is established on startup
    }

    private initializeClient() {
        this.client = createClient({
            url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
            socket: {
                connectTimeout: 10000,
                keepAlive: 0, // Disable keepAlive to prevent ECONNRESET
                noDelay: true,
                timeout: 30000
            },
            pingInterval: -1 // Disable ping
        });

        // Error handling
        this.client.on('error', (err: any) => {
            console.error('Redis client error:', err.message);
            this.handleConnectionError();
        });

        this.client.on('connect', () => {
            console.log('Redis client connecting...');
        });

        this.client.on('ready', () => {
            console.log('Redis client ready');
            this.connectionAttempts = 0;
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
        });

        this.client.on('end', () => {
            console.log('Redis connection ended');
            this.handleConnectionError();
        });
    }

    private async handleConnectionError() {
        if (this.isConnecting || this.reconnectTimer) return;

        this.connectionAttempts++;
        if (this.connectionAttempts > this.MAX_RETRY_ATTEMPTS) {
            console.error('Max Redis connection attempts reached');
            return;
        }

        this.isConnecting = true;
        this.reconnectTimer = setTimeout(async () => {
            try {
                console.log(`Attempting to reconnect to Redis (attempt ${this.connectionAttempts}/${this.MAX_RETRY_ATTEMPTS})...`);
                if (this.client.isOpen) {
                    await this.client.quit();
                }
                this.initializeClient();
                await this.connect();
            } catch (error) {
                console.error('Redis reconnection failed:', error);
            } finally {
                this.isConnecting = false;
                this.reconnectTimer = null;
            }
        }, this.RETRY_DELAY);
    }

    public async connect() {
        try {
            await this.client.connect();
        } catch (error) {
            console.error('Redis connection failed:', error);
            this.handleConnectionError();
        }
    }

    public async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (error) {
            console.error('Redis GET operation failed:', error);
            throw error;
        }
    }

    public async set(key: string, value: string, options?: { EX?: number }) {
        try {
            await this.client.set(key, value, options);
        } catch (error) {
            console.error('Redis SET operation failed:', error);
            throw error;
        }
    }

    public async quit() {
        try {
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
            }
            if (this.client.isOpen) {
                await this.client.quit();
            }
        } catch (error) {
            console.error('Error while closing Redis connection:', error);
        }
    }

    public isReady(): boolean {
        return this.client.isOpen;
    }
}

// Create singleton instance
const redisClient = new RedisClient();

// Handle process termination
process.on('SIGTERM', async () => {
    console.log('Shutting down Redis connection...');
    await redisClient.quit();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('Shutting down Redis connection...');
    await redisClient.quit();
    process.exit(0);
});

export default redisClient;