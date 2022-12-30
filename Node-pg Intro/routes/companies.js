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
		const result = await db.query(
			`SELECT code, name, description  
        FROM companies 
        WHERE code=$1`,
			[req.params.code]
		);
		if (result.rowCount === 0) return next();
		const invoiceResults = await db.query(
			`SELECT * 
        FROM invoices
        WHERE comp_code=$1`,
			[req.params.code]
		);
		const comp = result.rows[0];
		const invoices = invoiceResults.rows;
		const company = {
			code: comp.code,
			name: comp.name,
			description: comp.description,
			invoices: [invoices]
		};

		return res.json({ company: company });
	} catch (err) {
		return next(err);
	}
});

router.post("/", async (req, res, next) => {
	try {
		const result = await db.query(`INSERT INTO companies VALUES ($1, $2, $3) RETURNING *`, [
			req.body.code,
			req.body.name,
			req.body.description
		]);
		return res.json({ company: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.put("/:code", async (req, res, next) => {
	try {
		const result = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *`, [
			req.body.name,
			req.body.description,
			req.params.code
		]);
		if (result.rowCount === 0) return next();
		return res.json({ company: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.delete("/:code", async (req, res, next) => {
	try {
		const result = await db.query(`DELETE FROM companies * WHERE code=$1 RETURNING code`, [req.params.code]);
		if (result.rowCount === 0) return next();
		return res.json({ status: "deleted" });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
