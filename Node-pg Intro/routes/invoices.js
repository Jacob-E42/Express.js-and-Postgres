const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async function (req, res, next) {
	try {
		const results = await db.query(`SELECT id, comp_code FROM invoices;`);
		return res.json({ invoices: results.rows });
	} catch (err) {
		return next(err);
	}
});

router.get("/:id", async (req, res, next) => {
	try {
		const result = await db.query(
			`SELECT i.id,
            i.amt,
            i.paid,
            i.add_date,
            i.paid_date,
            c.code,
            c.name,
            c.description
            FROM invoices AS i
            INNER JOIN companies as c ON (c.code=i.comp_code)
            WHERE id=$1`,
			[req.params.id]
		);
		if (result.rowCount === 0) return next();
		const data = result.rows[0];
		const invoice = {
			id: data.id,
			amt: data.amt,
			paid: data.paid,
			add_date: data.add_date,
			paid_date: data.paid_date,
			company: {
				code: data.code,
				name: data.name,
				description: data.description
			}
		};
		return res.json({ invoice: invoice });
	} catch (err) {
		return next(err);
	}
});

router.post("/", async (req, res, next) => {
	try {
		const result = await db.query(
			`INSERT INTO invoices (comp_code, amt)
             VALUES ($1, $2) 
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
			[req.body.comp_code, req.body.amt]
		);
		return res.json({ invoice: result.rows[0] });
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
