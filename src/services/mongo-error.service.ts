export class MongoErrorService {

    handleMongoErrors(err: any, primaryField?: string) {
        if (err.name.toLowerCase() == 'bulkwriteerror') {
            let _wErrors = [];
            if (err.result.writeErrors) _wErrors = err.result.writeErrors;
            if (err.result.result && err.result.result.writeErrors) _wErrors = err.result.result.writeErrors;

            let writeErrors: string[] = _wErrors.map(er => {
                switch (er.err.code) {
                    case 11000: {
                        let messageField = JSON.stringify(er.err.op);
                        if (primaryField) {
                            messageField = er.err.op[primaryField] + 'is duplicate';
                        }
                        return `${messageField}`
                    }
                }
            });

            return writeErrors;
        }


        return null;
    }

}

export default new MongoErrorService();