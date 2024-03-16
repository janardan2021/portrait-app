class ExpressError extends Error {
    constructor (message, statusCode, redirectURL = '/') {
        super();
        this.message = message;
        this.statusCode = statusCode;
        this.redirectURL = redirectURL;
    }
}

module.exports = ExpressError;