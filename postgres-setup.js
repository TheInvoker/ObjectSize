// PostgreSQL library
var express = require('express');
var app = express();
var pg = require('pg');
var pgp = require('pg-promise')();

// Connect to PostgreSQL database
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:johncena@localhost:5432/test';
var db = pgp(connectionString);
db.connect();

db.query("DROP TABLE IF EXISTS users, company, user_company, images, tag, tag_images").then(function()
{
  createDatabases(db);
}).catch(function(err)
{
  console.log(err);
});

function makeUsers()
{
  db.query("CREATE TABLE users ( id serial primary key, email varchar(256) unique, \
    password varchar(256), username varchar(256) unique, date_joined date, active boolean)").then(function() {
        makeCompany();
    }).catch(function(err) {
        console.log("b");
    });
}

function makeCompany()
{
  db.query("CREATE TABLE company (id serial primary key, name varchar(256), \
    email varchar(256) unique, password varchar(256), date_joined date, active boolean)").then(function() {
        makeImages();
    }).catch(function(err) {
        console.log("c");
    });
}

function makeImages()
{
  db.query("CREATE TABLE images (id serial primary key, user_id integer REFERENCES users, \
    filepath text, px_width integer, px_height integer, real_width decimal, \
    real_height decimal, offsetX integer, offsetY integer, tag_id integer, \
    company_id integer REFERENCES company, date_created date, date_modified date, note varchar(256), active boolean)").then(function() {
        makeTags();
    }).catch(function(err) {
        console.log("d");
    });
}

function makeTags()
{
  db.query("CREATE TABLE tag (id serial primary key, name varchar(256))").then(function() {
        makeUserCompany();
    }).catch(function(err) {
        console.log("e");
    });
}

function makeUserCompany()
{
  db.query("CREATE TABLE user_company (company_id integer REFERENCES company, user_id integer REFERENCES users, \
        PRIMARY KEY(company_id, user_id))").then(function() {
        makeImagesTag();
    }).catch(function(err) {
        console.log("f");
    });
}

function makeImagesTag()
{
  db.query("CREATE TABLE tag_images (tag_id integer REFERENCES tag, image_id integer REFERENCES images, \
      primary key (tag_id, image_id))").then(function() {
        console.log("All tables created")
    }).catch(function(err) {
        console.log("g");
    });
}

function createDatabases(db)
{
  makeUsers();
}
