import Config from '../config';
import sgMail from '@sendgrid/mail';
import logger from '../helpers/logger';

sgMail.setApiKey(Config.SG_API_KEY);
export default class Mail {

    static send({ subject, to, html }) {
        const msg = {
            to: to,
            from: Config.MAIL_SENDER,
            subject: subject,
            html: html,
        };

        if (process.env.NODE_ENV == 'test') return;

        sgMail.send(msg)
            .then(() => logger.info("Mail Sent to", to))
            .catch((err) => logger.error(err));
    }

    static sendMany(mailConfigs: any[]) {
        if (process.env.NODE_ENV == 'test') return;

        mailConfigs.forEach(c => {
            c.from = Config.MAIL_SENDER
        })

        sgMail.send(mailConfigs)
            .then(() => logger.info("Mail Sent"))
            .catch((err) => logger.error(err));
    }
}