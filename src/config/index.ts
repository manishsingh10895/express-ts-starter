import { ImageConfig } from "./image.config";

export const PORT: number = 4004
export const ROUTES_DIR: string = './src/routes/**/*.ts'
export const MODELS_DIR: string = './src/models/**/*.ts'

export const FEE = 0.02;

export type Config = {
    DB_URL: string,
    PORT: number,
    DB_USER?: string,
    DB_PASS?: string,
    DB_NAME: string,
    DB_AUTH_DB?: string,
    API_URL: string,
    APP_URL: string,
    APP_NAME: string,
    SG_API_KEY: string,
    MAIL_SENDER: string,
    JWT_SECRET: string,
    REDIS_HOST: string,
    REDIS_PORT: number,
    IMAGE: ImageConfig,
}

const development: Config = {
    DB_URL: 'mongodb://localhost:27017/express-starter',
    PORT: 4004,
    API_URL: 'http://localhost:4004/v1',
    DB_NAME: 'experss-app',
    APP_URL: 'http://localhost:4200',
    APP_NAME: 'local',
    SG_API_KEY: '',
    MAIL_SENDER: "you@example.com",
    REDIS_HOST: "localhost",
    REDIS_PORT: 6379,
    JWT_SECRET: 'charge_something_for_i_am_dwindling',
    IMAGE: ImageConfig,
}

const test: Config = {
    ...development,
    APP_NAME: 'test',
    PORT: 4005,
    DB_URL: 'mongodb://localhost:27017/express-testing',
    API_URL: 'http://localhost:4005/v1',
    DB_AUTH_DB: undefined,
}

const production: Config = {
    ...development,
    DB_URL: 'mongodb://localhost:27017/express-production',
    API_URL: '',
    DB_USER: '',
    PORT: 4004,
    APP_NAME: 'express-production',
    DB_NAME: 'db-production',
    DB_PASS: '',
    DB_AUTH_DB: undefined,
}


const _configWrapper: { [name: string]: Config } = {
    development,
    test,
    production,
}

console.log(_configWrapper[process.env.NODE_ENV]);
console.log(process.env.NODE_ENV);

export const ALLCONFIG = _configWrapper;

export default _configWrapper[process.env.NODE_ENV || 'development'];