// PostgreSQL library
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
        console.log(err);
    });
}

function makeCompany()
{
  db.query("CREATE TABLE company (id serial primary key, name varchar(256), \
    email varchar(256) unique, password varchar(256), date_joined date, active boolean)").then(function() {
        makeImages();
    }).catch(function(err) {
        console.log(err);
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
        console.log(err);
    });
}

function makeTags()
{
  db.query("CREATE TABLE tag (id serial primary key, name varchar(256))").then(function() {
        makeUserCompany();
    }).catch(function(err) {
        console.log(err);
    });
}

function makeUserCompany()
{
  db.query("CREATE TABLE user_company (company_id integer REFERENCES company, user_id integer REFERENCES users, \
        PRIMARY KEY(company_id, user_id))").then(function() {
        makeImagesTag();
    }).catch(function(err) {
        console.log(err);
    });
}

function makeImagesTag()
{
  db.query("CREATE TABLE tag_images (tag_id integer REFERENCES tag, image_id integer REFERENCES images, \
      primary key (tag_id, image_id))").then(function() {
        console.log("All tables created");
        insertUsers();
    }).catch(function(err) {
        console.log(err);
    });
}

function insertUsers()
{
  db.query("INSERT INTO users (email, password, username, active) VALUES ('a', 'a', 'a', true), \
              ('b', 'b', 'b', true), ('c', 'c', 'c', true)").then(function()
  {
    insertCompanies();
  }).catch(function()
  {
    console.log("a");
  });
}

function insertCompanies()
{
  db.query("INSERT INTO company (name, email, password, active) VALUES ('A', 'A', 'A', true), \
              ('B', 'B', 'B', true), ('C', 'C', 'C', true)").then(function()
  {
    insertTags();
  }).catch(function()
  {
    console.log("b");
  });
}

function insertTags()
{
  db.query("INSERT INTO tag (name) VALUES ('aaa'), \
              ('bbbb'), ('cccc')").then(function()
  {
    console.log("all items added");
    insertImage();
  }).catch(function(err)
  {
    console.log(err);
  });
}

function insertImage()
{
  db.query("INSERT INTO images (user_id, filepath, px_width, px_height, real_width, \
    real_height, offsetX, offsetY, tag_id, company_id, active) VALUES (1, 'dsfasfafd.txt', 10, 10, 50, 50, 2, 2, 1, 1, true), \
    (2, 'cat.txt', 2, 5, 3, 3, 4, 4, 2, 2, true)").then(function()
    {
      getItems();
    }).catch(function()
    {
      console.log("Something wrong");
    });
}

function getItems()
{
  // Just testing a join
  db.query("SELECT images.id, company.name, filepath FROM images LEFT JOIN company ON company.id = images.user_id").then(function(data)
  {
    console.log("%s", "Here is the items");
    console.log(data);
  }).catch(function(err)
  {
    console.log(err);
  });
}

function createDatabases(db)
{
  makeUsers();
}
