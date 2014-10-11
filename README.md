# restify-starter
This project is a starter template for restify.js that includes:
* orm (node-orm2)
* overridable auto-routes for your models
* logging (bunyan)
* environment config (nconf)
* unit tests (mocha)
* database migrations (node-db-migrate)
* defined project structure
* db library for executing custom sql and stored procs

The goal is to give node.js API authors a starting point that will save you hours of headaches and give you a smarter starting point for your API. The project is based on real-world production APIs.

## Install Library Dependencies
After cloning this repository locally, run `npm install` to download and install all the node_modules.

## Create Database and User
### postgres
*NOTE: Currently this starter kit only supports Postgresql.  It's not difficult to support any database that node-orm2 can support though, including MySQL, MariaDB, and MongoDB. Install postgres locally: `brew install postgresql`*
```
psql -U postgres
drop database if exists restify_starter;
create database restify_starter;
create role apiuser with superuser password 'Password1!';
grant all privileges on database restify_starter to apiuser;
```
## Sync Models
Run `node syncModels` to sync the models with your database.

## Run Migrations
Run the database migrations to insert some test data: `db-migrate up --config config/database.json`

## Run Tests
* At the command, run `mocha`. It should successfully run all the unit tests. If so, congrats! You're all set.

## Run the API server
To run the API, `node server` to run in local mode on port 3000. In production, configuration management allows you to specify what port to run on (currently port 80). Depending on whether you are deploying behind a proxy or load balancer, hosting requirements, etc. this may need to change.