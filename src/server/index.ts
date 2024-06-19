import * as bodyParser from 'body-parser'
import cloudflare from 'cloudflare-express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import logger from 'morgan'
import * as path from 'path'
import { ConnectDb } from '../connections/mongoose.connection'
import Redis from '../connections/redis.connection'
import _logger from '../helpers/logger'
import AuthRoute from '../routes/auth.routes'
import UserRoute from '../routes/user.routes'
import { Encryption } from '../services/encryption.service'


export default function () {
    const app: express.Express = express()

    // for (const model of globFiles(MODELS_DIR)) {
    //   require(path.resolve(model))
    // }

    try {
        const redis = Redis.connect();
    } catch (err) {
        _logger.warn("Redis couldnt't connect")
        _logger.error(err);
    }

    ConnectDb();
    new Encryption();

    app.set('trust proxy', true);
    app.set('views', path.join(__dirname, '../../src/views'))
    app.set('view engine', 'pug')
    app.use(logger('dev'))
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(cookieParser())
    app.use(cors());
    app.use(helmet());
    app.use(cloudflare.restore({ update_on_start: true }));


    let staticPath = path.resolve(__dirname, '../../public');
    console.log(staticPath);
    app.use('/v1', express.static(staticPath))


    /** ROUTES  */
    new AuthRoute(app);
    new UserRoute(app);
    /** ROUTES */

    app.use(function (req, res) {
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.send(404);
        } else {
            res.status(404).render('not-found')
        }
    });


    app.use(function (err, req, res, next) {
        _logger.error(err);
        if (err && err.name && err.name == 'app-error') {
            let message = err.error;
            let description = err.message;

            return res.status(message.status || 400)
                .json({
                    success: false,
                    message: message.msg,
                    status: {
                        code: message.code,
                        description
                    }
                })
        }
        //@ts-ignore
        res.sendStatus(500);
    })

    return app
}
