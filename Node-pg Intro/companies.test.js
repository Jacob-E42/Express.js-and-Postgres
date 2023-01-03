process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("./app");
const db = require("./db");

beforeEach(async function () {
	await db.query(`INSERT INTO companies
	VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
		   ('ibm', 'IBM', 'Big blue.')`);
});

afterEach(async function () {
	await db.query(`DELETE FROM companies * RETURNING code`);
});

afterAll(function () {
	db.end();
});

describe("GET /companies", function () {
	test("gets all companies", async function () {
		const resp = await request(app).get("/companies");
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			"companies": [
				{
					"code": "apple",
					"name": "Apple Computer"
				},
				{
					"code": "ibm",
					"name": "IBM"
				}
			]
		});
	});
});
