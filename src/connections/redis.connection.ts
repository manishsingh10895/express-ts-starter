import * as redis from 'redis';
import config, { ALLCONFIG } from '../config';
import logger from '../helpers/logger';

export class RedisConnection {

    client: redis.RedisClient;

    constructor() {
        console.log("REDIS ALREADY", this.client);
        if (!this.client) {
            this.connect();
        }
    }

    _makeKey(key: string) {
        return `${config.APP_NAME}:${key}`;
    }

    connect() {
        if (this.client) return this.client;

        this.client = redis.createClient({
            host: config.REDIS_HOST,
            port: config.REDIS_PORT,
            max_attempts: 3
        });

        this.client.on('error', this.onError);

        return this.client;
    }

    onError(err) {
        logger.error("Failed to connect redis");
        logger.error(err);
        // console.error(err);
    }

    hasKey(key: string) {
        return new Promise<any>((resolve, reject) => {
            this.client.keys(this._makeKey(key), (err, res) => {
                if (err) {
                    reject(err);
                }

                resolve(res ? true : false);
            })
        });
    }

    lpush(key: string, ...args) {
        return new Promise((resolve, reject) => {
            this.client.lpush(this._makeKey(key), ...args, (err, res) => {
                if (err) reject(err);

                resolve(res ? true : false);
            });
        })
    }

    lrem(key: string, count: number, value: string) {
        return new Promise((resolve, reject) => {
            this.client.lrem(this._makeKey(key), count, value, (err, res) => {
                if (err) return reject(err);

                resolve(res);
            });
        })
    }

    put(key: string, value: any) {
        return new Promise((resolve, reject) => {
            this.client.set(this._makeKey(key), value, (err, res) => {
                if (err) {
                    reject(err);
                }

                resolve(res);
            });
        })
    }

    get(key: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.client.get(this._makeKey(key), (err, res) => {
                if (err) {
                    reject(err);
                }

                resolve(res);
            });
        })
    }


    delete(key: string) {
        return new Promise((resolve, reject) => {
            this.client.del(this._makeKey(key), (err, res) => {
                if (err) {
                    reject(err);
                }

                resolve(res);
            });
        })
    }

    onSuccess() {

    }

    lrange(key: string, start: number, stop: number): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.client.lrange(this._makeKey(key), start, stop, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    }

    del(key: string) {
        return new Promise((resolve, reject) => {
            this.client.del(this._makeKey(key), (err, result) => {
                if (err) reject(err);

                else resolve(result);
            });
        })
    }

    setex(key: string, seconds: number, value: string) {
        return new Promise((resolve, reject) => {
            this.client.setex(key, seconds, value, (err, result) => {
                if (err) reject(err)
                else resolve(result)
            })
        })
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

    subscribe(channel) {
        // Object.keys(ALLCONFIG)
        //     .forEach(k => {
        //         console.log("subcribing ", k, "+", channel);
        //         this.client.subscribe(ALLCONFIG[k].APP_NAME + channel);
        //     })
        console.log("subscribing", this._makeKey(channel));
        this.client.subscribe(this._makeKey(channel));
    }

    publish(channel, data: any) {
        if (typeof data != 'string') {
            data = JSON.stringify(data);
        }

        this.client.publish(this._makeKey(channel), data);
    }
}

export default new RedisConnection();

