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

describe("POST to /companies", function () {
	test("add a new company and return it", async function () {
		const co = {
			"code": "me",
			"name": "myself",
			"description": "I am a company."
		};
		const resp = await request(app).post("/companies").send(co);
		expect(resp.body).toEqual({
			"company": {
				"code": "me",
				"name": "myself",
				"description": "I am a company."
			}
		});
	});
});

describe("PUT /companies", function () {
	test("update an existing company", async function () {
		const co = {
			"name": "Real Company",
			"description": "I am a real company."
		};
		const resp = await request(app).put("/companies/ibm").send(co);
		expect(resp.body).toEqual({
			"company": {
				"code": "ibm",
				"name": "Real Company",
				"description": "I am a real company."
			}
		});
	});
});
