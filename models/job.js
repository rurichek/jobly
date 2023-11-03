"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
    static async create({ company_handle, title, salary, equity }) {
        const result = await db.query(
            `INSERT INTO jobs
            (company_handle, title, salary, equity)
            VALUES ($1, $2, $3, $4)
            RETURNING company_handle AS "companyHandle", title, salary, equity`,
            [
                company_handle,
                title,
                salary,
                equity,

            ],
        );
        const job = result.rows[0]
        console.log(job)

        return job;
    }

    // Given all jobs;
    // searchFilters (all optional):
    //  - title
    //  - minSalary
    //  - hasEquity (true/false)

    static async findAll(searchFilters = {}) {
        let query = `SELECT id,
                            title,
                            salary,
                            equity,
                            company_handle AS "companyHandle",
                            (SELECT name FROM companies WHERE handle = jobs.company_handle) AS "companyName"
                    FROM jobs`;
        let whereExpressions = [];
        let queryValues = [];

        const { minSalary, hasEquity, title } = searchFilters;

        if (title) {
            queryValues.push(`%${title}%`);
            whereExpressions.push(`title ILIKE $${queryValues.length}`);
        }

        if (minSalary !== undefined) {
            queryValues.push(minSalary);
            whereExpressions.push(`salary >= $${queryValues.length}`);
        }

        if (hasEquity === true) {
            // queryValues.push(hasEquity);
            whereExpressions.push(`equity > 0`);
        }

        if (whereExpressions.length > 0) {
            query += " WHERE " + whereExpressions.join(" AND ");
        }

        // Finalize query and return results

        query += " ORDER BY title";
        const jobsRes = await db.query(query, queryValues);
        return jobsRes.rows;
    }

    // given a job title, return data about the job

    static async get(id) {
        const jobRes = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`,
            [id]
        );

        const job = jobRes.rows[0];

        if (!job) throw new NotFoundError(`No job with such id: ${id}`);

        const companiesRes = await db.query(
            `SELECT handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"
             FROM companies
             WHERE handle = $1`, [job.companyHandle]);

        job.company = companiesRes.rows[0] ? {
            handle: companiesRes.rows[0].handle,
            name: companiesRes.rows[0].name,
            description: companiesRes.rows[0].description,
            numEmployees: companiesRes.rows[0].numEmployees,
            logoUrl: companiesRes.rows[0].logoUrl,
        } : undefined;    
             
        delete job.companyHandle;

        return job; 
    }

    // update job data with data
    // cannot change the id or the company associated with a job

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {}); 
        const handleVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs 
                            SET ${setCols}
                            WHERE id = ${handleVarIdx}
                            RETURNING id,
                                    title,
                                    salary,
                                    equity,
                                    company_handle AS "companyHandle"`
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if(!job) throw new NotFoundError(`No job with id: ${id}`);

        return job;
    }


    // Delete given job from databse; return undefined. 

    static async remove(id) {
        const result = await db.query(
            `DELETE
            FROm jobs
            WHERE id = $1
            RETURNING id`, [id]
        );
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);
    }
}


module.exports = Job;