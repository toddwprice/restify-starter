# restify-starter
This project is a starter template for restify.js that includes:
* orm (node-orm2)
* overridable auto-routes for your models
* logging (bunyan)
* environment config (nconf)
* database migrations (node-db-migrate)
* defined project structure
* db library for executing custom sql and stored procs

The goal is to give node.js API authors a starting point that will save you hours of headaches and give you a smarter starting point for your API. The project is based on real-world production APIs.

## Database Setup
Currently this starter kit only supports Postgresql.  It's not difficult to support any database that node-orm2 can support though, including MySQL, MariaDB, and MongoDB. 

1. After cloning this repository locally, run `npm install` to download and install all the node_modules.
2. Install postgres locally: `brew install postgresql`
3. Create the database: 

```
psql -U postgres
drop database if exists restify_starter;
create database restify_starter;
```

4. Create a user 'apiuser' with password 'Password1!'.  Use pgadmin [GUI tool for Postgres](http://www.pgadmin.org/download/) to create the user, and specify it as `superuser`.
5. `grant all privileges on database restify_starter to apiuser;`
6. Run database migrations to insert some test data: `db-migrate up --config config/database.json`
7. At the command, run `mocha`. It should successfully run all the unit tests. If so, congrats! You're all set.
8. To run the API, `node server` to run in local mode on port 3000. In production, configuration management allows you to specify what port to run on (currently port 80). Depending on whether you are deploying behind a proxy or load balancer, hosting requirements, etc. this may need to change.
