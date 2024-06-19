import * as redis from 'redis';
import config, { ALLCONFIG } from '../config';
import logger from '../helpers/logger';

export class RedisConnection {

    client: redis.RedisClientType;

    constructor() {
        console.log("REDIS ALREADY", this.client);
        if (!this.client) {
            this.connect();
        }
    }

    _makeKey(key: string) {
        return `${config.APP_NAME}:${key}`;
    }

    async connect() {
        if (this.client) return this.client;

        this.client = redis.createClient({
            socket: {
                host: config.REDIS_HOST,
                port: config.REDIS_PORT,
                reconnectStrategy: (times) => {
                    if (times > 10) {
                        logger.error("Redis connection failed");
                        process.exit(1);
                    }
                    return Math.min(times * 50, 2000);
                }
            },
        });

        await this.client.connect();
        await this.client.ping();

        this.client.on('error', this.onError);

        return this.client;
    }

    onError(err) {
        logger.error("Failed to connect redis");
        logger.error(err);
        // console.error(err);
    }

    async hasKey(key: string) {
        return await this.client.keys(this._makeKey(key));
    }

    async lpush(key: string, args: string[]) {
        return await this.client.lPush(this._makeKey(key), args);
    }

    async lrem(key: string, count: number, value: string) {
        return await this.client.lRem(this._makeKey(key), count, value);
    }

    async put(key: string, value: any) {
        return await this.client.set(this._makeKey(key), value);
    }

    async get(key: string): Promise<string> {
        return await this.client.get(this._makeKey(key));
    }


    async delete(key: string) {
        return await this.client.del(this._makeKey(key));
    }

    onSuccess() {

    }

    async lrange(key: string, start: number, stop: number): Promise<string[]> {
        return await this.client.lRange(this._makeKey(key), start, stop);
    }

    async del(key: string) {
        return await this.client.del(this._makeKey(key))
    }

    async setex(key: string, seconds: number, value: string) {
        return await this.client.setEx(key, seconds, value);
    }

    onMessage(channel, cb) {
        this.client.on('message', (ch, message) => {
            if ((this._makeKey(channel)) == ch) {
                console.log("callback message");
                console.log("----------------------");
                console.log();
                cb(message);
            }
        })
    }

    subscribe(channel, listener: (message, channel) => void) {
        console.log("subscribing", this._makeKey(channel));

        this.client.subscribe(this._makeKey(channel), listener);
    }

    publish(channel, data: any) {
        if (typeof data != 'string') {
            data = JSON.stringify(data);
        }

        this.client.publish(this._makeKey(channel), data);
    }
}

export default new RedisConnection();

