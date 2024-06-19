import mongoose, { mongo } from 'mongoose';
import config from '../config';
import logger from '../helpers/logger';
import { Roles } from '../infra/roles'
import redisConnection from './redis.connection';

let connection: mongoose.Connection;

export const ConnectDb = () => {
    if (connection) return;

    logger.info("Connecting to db " + config.DB_URL);


    mongoose.connect(config.DB_URL, {
        user: config.DB_USER,
        pass: config.DB_PASS,
        authSource: config.DB_AUTH_DB,
    })
        .then(() => {
            connection = mongoose.connection;
            if (process.env.PROCESS_TYPE && process.env.PROCESS_TYPE == 'subcriber') {
                return;
            }
            activateListeners(connection);
            dataSurityCheck(connection);
        })
        .catch((err) => {
            logger.error("DB connection failed")
            logger.error(err);
        })
}

const activateListeners = (connection) => {
    connection.on('connect', () => {
        logger.info("Mongoose connection established successfully");
    })
}

/**
 * use this to insert required data in mongodb to the backend to serve well
 * @param connection 
 */
const dataSurityCheck = async (connection) => {
    logger.info("mongoose.connection.dataSurityCheck");
}