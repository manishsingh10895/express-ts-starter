import * as winston from 'winston';
import { format } from 'url';

let transports: Array<any> = [

]

if (process.env.NODE_ENV == 'development' || process.env.NODE_ENV == 'test' || !process.env.NODE_ENV) {
    transports.push(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.colorize({ all: true }),
        )
    }))
}

if (process.env.NODE_ENV == 'production') {
    // transports.push(new winston.transports.File({
    //     filename: "log",
    //     format: winston.format.combine(
    //         winston.format.timestamp(),
    //         winston.format.errors({ stack: true }),
    //         winston.format.colorize({ all: true }),
    //     )
    // }))

    transports.push(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.colorize({ all: true }),
        )
    }))
}


const enumerateErrorFormat = winston.format(info => {
    if ((info.message as any) instanceof Error) {
        info.message = Object.assign({
            message: (info.message as any).message,
            stack: (info.message as any).stack
        }, info.message);
    }

    if (info instanceof Error) {
        return Object.assign({
            message: info.message,
            stack: info.stack
        }, info);
    }

    return info;
});

const logger = winston.createLogger({
    format: winston.format.combine(
        enumerateErrorFormat(),
        winston.format.json()
    ),
    transports,
})

export default logger;

