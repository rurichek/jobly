"use strict"

// routes for jobs

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Job = require("../models/job");
const { createToken } = require("../helpers/tokens");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = express.Router({ mergeParams: true });

/* POST / { job } => { job }

job should be {title, salary, equity, companyHandle }

Returns { id, title, salary, equity, companyHandle }

Authorization required: admin

*/

router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (err) {
        return next(err);
    }
});

router.get("/", async function (req, res, next) {
    const q = req.query;
    // arrive as strings from querystring, but we want as int/bool
    if (q.minSalary !== undefined) q.minSalary = Number(q.minSalary);
    if (q.hasEquity !== undefined) q.hasEquity = q.hasEquity === "true";
  
    try {
      const validator = jsonschema.validate(q, jobSearchSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const jobs = await Job.findAll(q);
      return res.json({ jobs });
    } catch (err) {
      return next(err);
    }
  });

// get job by id

router.get("/:id", async function (req, res, next) {
    try{
        const job = await Job.get(req.params.id);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
})

// patch by job id

router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });

    } catch (err) {
        return next(err);
    }

})


// DELETE /[handle] => { delted: id }

router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
        await Job.remove(req.params.id);
        return res.json({ deletes: +req.params.id });
    } catch (err) {
        return next(err);
    }
})





  module.exports = router;
