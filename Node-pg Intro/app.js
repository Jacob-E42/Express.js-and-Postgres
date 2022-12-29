const express = require("express");
const morgan = require("morgan");
const ExpressError = require("./expressError");
const router = require("./routes");
const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(router);

app.use(function (req, res, next) {
	const notFoundError = new ExpressError("Not Found", 404);
	return next(notFoundError);
});
app.use(function (err, req, res, next) {
	let status = err.status || 500;
	let message = err.message;
	return res.status(status).json({ error: { message, status } });
});
module.exports = app;
