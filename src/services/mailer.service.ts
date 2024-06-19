import IFMailer from 'if-mailers';
import Mail from '../services/mail-core.service';
import config from '../config';
import logger from '../helpers/logger';

let mailer = new IFMailer.Mailer()
const Stringer = IFMailer.Stringer;

mailer.setOptions({
    appName: "LifeInvestments",
    address: "",
    social: {},
});

const SUBJECTS = {
    "VERIFY": "Verify your email",
    "RESET": "Reset your password",
    "WELCOME": "Welcome to BetaFunds!",
    "ACCOUNT_CREATE": "Your account has been created",
    "PASSWORD_RESET": "Password reset by admin"
};

class Mailer {
    async sendWelcome(email: string, username: string) {

        logger.info("insurance-mail.service.sendWelcome");

        let html = mailer.getWelcome(username);

        await Mail.send({ subject: SUBJECTS.VERIFY, to: email, html })
    }

    /**
     * Send confirmation mail
     * @param username firstname
     */
    async sendConfirmation(email: string, username: string, token) {
        logger.info("insurance-mail.service.sendConfirmation");

        logger.info("Email: ", email);

        try {
            let link = config.API_URL + '/auth/verify/' + token;

            let html = mailer.getEmailConfirmation(username, link);

            await Mail.send({ subject: SUBJECTS.VERIFY, to: email, html })
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async sendAccountCreated(firstName: string, email: string, password: string) {
        logger.info("insurance-mail.service.sendAccountCreated");
        try {
            let _mailer = new IFMailer.Mailer({ address: '', appLink: config.APP_URL, appName: config.APP_NAME, social: {} });

            let html = _mailer.getAccountCreated(firstName, email, password, config.APP_URL + '/auth/login');

            await Mail.send({ subject: SUBJECTS.ACCOUNT_CREATE, html: html, to: email });
        } catch (err) {
            logger.error(err);
            throw err
        }
    }

    /**
     * 
     * @param email 
     * @param fistName 
     * @param newPassword 
     */
    async sendPasswordReset(email: string, fistName: string, newPassword: string) {
        logger.info("insurance-mail.service.sendPasswordReset");
        try {
            let _mailer = new IFMailer.Mailer({ appLink: config.APP_URL + '/auth/login', appName: config.APP_NAME });

            let html = _mailer.getPasswordReset(email, fistName, newPassword);

            await Mail.send({ subject: SUBJECTS.PASSWORD_RESET, html, to: email });
        } catch (err) {
            logger.error(err);
            throw err
        }
    }

    async sendLeadAccountCreated(firstName: string, email: string, password: string) {
        logger.info("insurance-mail.service.sendLeadAccountCreated");
        try {
            let _mailer = new IFMailer.Mailer({ address: '', appLink: "https://telexsale.com", appName: "LifeInvestments", social: {} });

            let html = _mailer.getAccountCreated(firstName, email, password, config.APP_URL + '/auth/login');

            await Mail.send({ subject: SUBJECTS.ACCOUNT_CREATE, html: html, to: email });
        } catch (err) {
            logger.error(err);
            throw err
        }
    }
}

export default new Mailer(); 