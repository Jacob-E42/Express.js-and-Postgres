const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/", async function (req, res, next) {
	try {
		const results = await db.query(`SELECT code, name FROM companies;`);
		return res.json({ companies: results.rows });
	} catch (err) {
		return next(err);
	}
});

router.get("/:code", async (req, res, next) => {
	try {
		const result = await db.query(`SELECT * FROM companies WHERE code=$1`, [req.params.code]);
		if (result.rowCount === 0) return next();
		return res.json({ company: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
