# Jobly Backend

This is the Express backend for Jobly, version 2.

To run this:

    node server.js
    
To run the tests:

    jest -i
PART 1
sql.js
	
sqlForPartialUpdate 

This function assists in creating SQL statement parts for performing partial updates in an SQL table.

Parameters:

dataToUpdate (Object): The data that needs to be updated. The keys represent column names (in JavaScript-friendly casing), and the values represent the new values for those columns.

jsToSql (Object): An optional mapping from JavaScript style naming (camelCase) to SQL column names (snake_case). This aids in converting JavaScript object properties to their corresponding SQL column names. If a column doesn't exist in the mapping, the function assumes that the column name in the SQL table matches the key in dataToUpdate.

Returns
(Object): An object containing two properties:
setCols (String): A comma-separated string of SQL-like column assignment statements.
values (Array): An array of values from the dataToUpdate object in the order they should appear in the SQL query.
Throws
BadRequestError: If the dataToUpdate object is empty, indicating that there's no data provided for the update.

PART 2: Adding Filtering

findAll in company.js

parameter whereExpressions stores the actual values of the query strings. For example minEmployees=300, would store that value as `num of employees >= $1, where one represents the index of queryValues. And in this case the value of query numbers is 300. In the end it adds up all the query parameters and sends the request to SQL. 

route.get("/") in companies.js

  if (q.minEmployees !== undefined) q.minEmployees = +q.minEmployees;
  if (q.maxEmployees !== undefined) q.maxEmployees = +q.maxEmployees;

the plus in the above code converts a string into an integer. It's a short way of converting a string into an integer. 

companySearch.json

this schema validates that the query parameters are actually valid. We have integers and strings where they are supposed to be. 

Part 3: Change Authorization

In the companies routes, the authorization for updating, deleting companies is change to is_admin, meaning only the admins can do run these routes. 

In the users routes, creating users permissions have been changed to admin (registration, however, remains open to everyone). Getting the list of all users is only allowed for admins. Permissions to get information on a user, updating, or deleting a user are given to the admin and to that user. 

Part 4: Jobs

Added Job Model, and routes. 

The job model includes static functions for creating a job, finding all jobs, getting a job by id, updating a job, and removing a job. The code is self explanatory. 

the jobs routes were added. anyone can get the jobs, but only admins can add, update, or delete them. The code is self explanatory. 

Filtering was added to the get route for the jobs. You can filter by title ( case insensitive, matches-any-part-of-string search.). you can also filter by minSalary and whether there is equity (true or false).

GET /companies/:handle has been changed to include all the information about the jobs associated with that company.  

`{ ... other data ... , jobs: [ { id, title, salary, equity}, ... ] }`

##

you can find this method in the models section of companies specifically the get function. the code is self explanatory. 

STEP FIVE: Job Applications

a method has been added to the User model, allowing users to apply for a job. This method is labled as applyToJob. it take in two parameters: username, and jobId. it prechecks if the id and username is available. And then it inserts into applications table the job id and the associated username returning: { applied: jobId }

the user method for get(username) has been updated to include the jobs that this user has applied to. the code is self explanatory. 











