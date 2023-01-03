const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

/** GET / => list of invoices.
 *
 * =>  {invoices: [{id, comp_code}, ...]}
 *
 * */
router.get("/", async function (req, res, next) {
	try {
		const results = await db.query(`SELECT id, comp_code FROM invoices;`);
		return res.json({ invoices: results.rows });
	} catch (err) {
		return next(err);
	}
});

/** GET /[id] => detail on invoice
 *
 * =>  {invoices: {id,
 *                amt,
 *                paid,
 *                add_date,
 *                paid_date,
 *                company: {code, name, description}}}
 *
 * */
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

/** POST / => add new invoice
 *
 * {comp_code, amt}  =>  {id, comp_code, amt, paid, add_date, paid_date}
 *
 * */
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

/** PUT /[code] => update invoice
 *
 * {amt, paid}  =>  {id, comp_code, amt, paid, add_date, paid_date}
 *
 * If paying unpaid invoice, set paid_date; if marking as unpaid, clear paid_date.
 * */
router.put("/:id", async (req, res, next) => {
	const { amt, paid } = req.body;
	const id = req.params.id;
	let paidDate;

	let currInvoice = await db.query(`SELECT paid, paid_date FROM 	invoices WHERE id = $1`, [id]);
	if (currInvoice.rowCount === 0) throw new ExpressError("No such invoice.", 404);

	const currPaidDate = currInvoice.rows[0].paid_date;
	if (paid && !currPaidDate) paidDate = new Date();
	else if (!paid) paidDate = null;
	else paidDate = currPaidDate;
	try {
		const result = await db.query(
			`UPDATE invoices SET amt=$1, paid = $2, paid_date = $3
            WHERE id=$4
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
			[amt, paid, paidDate, id]
		);
		if (result.rowCount === 0) return next();
		return res.json({ invoice: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

/** DELETE /[code] => delete invoice
 *
 * => {status: "deleted"}
 *
 */
router.delete("/:id", async (req, res, next) => {
	try {
		const result = await db.query(`DELETE FROM invoices * WHERE id=$1 RETURNING id`, [req.params.id]);
		if (result.rowCount === 0) return next();
		return res.json({ status: "deleted" });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
