const express = require("express");
const db = require("../db");
const router = express.Router();
const slugify = require("slugify");

/** GET / => list of companies.
 *
 * =>  {companies: [{code, name, descrip}, {code, name, descrip}, ...]}
 *
 * */
router.get("/", async function (req, res, next) {
	try {
		const results = await db.query(`SELECT code, name FROM companies`);
		return res.json({ companies: results.rows });
	} catch (err) {
		return next(err);
	}
});

/** GET /[code] => detail on company
 *
 * =>  {company: {code, name, descrip, invoices: [id, ...]}}
 *
 * */
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
			`SELECT id
        FROM invoices
        WHERE comp_code=$1`,
			[req.params.code]
		);

		const comp = result.rows[0];
		const code = comp.code;
		const industriesResults = await db.query(
			`SELECT i.industry FROM industries as i
		LEFT JOIN companies_industries as ci
		ON i.code = ci.ind_code
		LEFT JOIN companies as c
		ON c.code = ci.comp_code
		WHERE c.code = $1`,
			[code]
		);
		const invoices = invoiceResults.rows;
		const industries = industriesResults.rows;
		const company = {
			code,
			name: comp.name,
			description: comp.description,
			invoices: [invoices],
			industries: [industries]
		};

		return res.json({ company: company });
	} catch (err) {
		return next(err);
	}
});

/** POST / => add new company
 *
 * {name, descrip}  =>  {company: {code, name, descrip}}
 *
 * */
router.post("/", async (req, res, next) => {
	const code = slugify(req.body.code, { lower: true, strict: true, trim: true });
	try {
		const result = await db.query(
			`INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3) 
        RETURNING code, name, description`,
			[code, req.body.name, req.body.description]
		);
		return res.json({ company: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

/** PUT /[code] => update company
 *
 * {name, descrip}  =>  {company: {code, name, descrip}}
 *
 * */
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

/** DELETE /[code] => delete company
 *
 * => {status: "added"}
 *
 */
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
