class ExpressError extends Error {
	constructor(msg, status) {
		super();
		this.status = status;
		this.message = msg;
		console.error(this.stack);
	}
}
module.exports = ExpressError;
