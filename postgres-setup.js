// PostgreSQL library
var express = require('express');
var app = express();
var pg = require('pg');
var pgp = require('pg-promise')();

// Connect to PostgreSQL database
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:johncena@localhost:5432/test';
var db = pgp(connectionString);
db.connect();

db.query("DROP TABLE users, company, user_company, images, tag, tag_images").then(function()
{
  createDatabases(db);
}).catch(function(err)
{
  console.log("C");
});

function createDatabases(db)
{
  // Call a sql
  db.query("CREATE TABLE users ( id serial primary key, email varchar(256) unique, \
    password varchar(256), username varchar(256) unique, date_joined date, active boolean)").then(function()
  {
    //console.log("Database for users created");
  }).catch(function()
  {
    //console.log("Table created already, or check your syntax");
  });

  db.query("CREATE TABLE company (id serial primary key, name varchar(256), \
    email varchar(256) unique, password varchar(256), date_joined date, active boolean)").then(function()
  {
    //console.log("Database for company created");
  }).catch(function()
  {
    //console.log("Table already created, or check your syntax");
  });

  db.query("CREATE TABLE user_company (company_id integer, user_id integer, \
      primary key(company_id, user_id))").then(function()
  {
    //console.log("Created user-company table");
  }).catch(function()
  {
    //console.log("Check your syntax or table exists");
  });

  db.query("CREATE TABLE images (id serial primary key, user_id integer, \
    filepath text, px_width integer, px_height integer, real_width decimal, \
    real_height decimal, offsetX integer, offsetY integer, tag_id integer, \
    company_id integer, date_created date, date_modified date, active boolean)").then(function()
  {
    //console.log("Created images table");
  }).catch(function()
  {
    //console.log("Something went wrong or check your syntax");
  });

  db.query("CREATE TABLE tag (id serial primary key, name varchar(256))").then(function()
  {
    //console.log("Created tag table");
  }).catch(function()
  {
    //console.log("Check your syntax or table exists");
  });

  db.query("CREATE TABLE tag_images (tag_id integer, image_id integer, \
      primary key (tag_id, image_id))").then(function()
  {
    //console.log("Created tag-image table");
  }).catch(function()
  {
    //console.log("Check your syntax or table exists");
  });
}
