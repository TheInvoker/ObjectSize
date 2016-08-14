var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();
var PORT = 8000;
var DIR_NAME = __dirname + '/public/'

app.use(express.static(DIR_NAME));
app.use(bodyParser.json());
app.use(session({secret: 'afkjdftfdy4778412', resave: false, saveUninitialized: false}));

app.get('/', function(req, res)
{
  res.send("Hello World");
});

app.get('/login', function(req, res)
{
  var email = req.body.email;
  var password = req.body.pass;

  db.query("SELECT * FROM users WHERE email = $1 AND password = $2", [email, password]).then(function(data)
  {
    if (email == data[0].email && password == data[0].password)
    {
      req.session.id = data[0].id;
      req.session.email = email;
      req.session.password = password;
      req.session.username = data[0].username;

      res.redirect('/profile');
    }
  }).catch(function(err)
  {
    console.log(err);
  });
});

app.get('/companyImages/:id', function(req, res)
{
  var companyId = req.params.id;

  db.query("SELECT * FROM images WHERE company_id = $1", [companyId]).then(function(data)
  {
    res.send(data);
  }).catch(function(err)
  {
    console.log(err);
  });
});

app.get('/company/:id', function(req, res)
{
  db.query("SELECT * FROM company WHERE id = $1", [req.params.id]).then(function(data)
  {
    res.send(data);
  }).catch(function(err)
  {
    console.log(err);
  });
});

app.get('/images/:id', function(req, res)
{
  db.query("SELECT * FROM images WHERE id = $1", [req.params.id]).then(function(data)
  {
    res.send(data);
  }).catch(function(err)
  {
    console.log(err);
  });
});

app.get('/profile/:id', function(req, res)
{
  db.query("SELECT * FROM users WHERE id = $1", [req.params.id]).then(function(data)
  {
    res.send(data);
  }).catch(function(err)
  {
    console.log(err);
  });
});

app.post('/registerUser', function(req, res)
{
  var email = req.body.email;
  var password = req.body.password;
  var username = req.body.username;

  db.query("INSERT INTO users (email, password, username, date, active) VALUES \
    ($1, $2, $3, now(), true)", [email, password, username]).then(function()
  {
    res.redirect('/confirmLink');
  }).catch(function(err)
  {
    console.log(err);
  })
});

app.post('/registerCompany', function(req, res)
{
  var name = req.body.companyName;
  var password = req.body.companyPassword;

  db.query("INSERT INTO company (name, password, date_joined, active) VALUES \
    ($1, $2, now(), true)", [name, password]).then(function()
  {
    res.redirect('/confirmLink');
  }).catch(function(err)
  {
    console.log(err);
  });
});

app.get('/companies', function(req, res)
{
  db.query("SELECT * FROM user_company WHERE user_id = $1", [req.session.id]).then(function(data)
  {
    res.send(data);
  }).catch(function(err)
  {
    console.log(err);
  });
});

app.get('/confirmLink', function(req, res)
{
  res.send("Link to confirm your email");
});

app.post('/deleteImage/:id', function(req, res)
{
    var id = req.params.id;

    db.query("DELETE FROM images WHERE id = $1", [id]).then(function()
    {
      res.redirect('/images');
    }).catch(function(err)
    {
      console.log(err);
    });
});

app.get('/deactivate', function(req, res)
{
  db.query("UPDATE users SET active = false WHERE email = $1", [req.session.email]);
  res.send("Your account is now deactivated.");
});

app.get('/updateUser', function(req, res)
{
  var new_username = req.body.username;
  var new_password = req.body.password;
  var new_email = req.body.email;

  if (new_username != "")
  {
    db.query("UPDATE users SET username = $1 WHERE email = $2", [new_username, req.session.email]).then(function()
    {
      console.log("User info updated.");
    }).catch(function(err)
    {
      console.log(err);
    });
  }
  if (new_password != "")
  {
    db.query("UPDATE users SET password = $1 WHERE email = $2", [new_password, req.session.email]).then(function()
    {
      console.log("Password info updated.");
    }).catch(function(err)
    {
      console.log(err);
    });
  }
  if (new_email != "")
  {
    db.query("UPDATE users SET email = $1 WHERE email = $2", [new_email, req.session.email]).then(function()
    {
      console.log("Email info updated.");
    }).catch(function(err)
    {
      console.log(err);
    });
  }
});

app.post('/addCompany', function(req, res)
{
  db.query("INSERT INTO user_company VALUES ($1, $2)", [req.session.id, req.body.companyId]).then(function()
  {
    res.send("Company was successfully added to profile.");
  }).catch(function(err)
  {
    console.log(err);
  })
});

app.post('/removeCompany', function(req, res)
{
  db.query("DELETE FROM user_company WHERE user_id = $1 AND company_id = $2", [req.session.id, req.body.companyId]).then(function()
  {
    res.send("Company successfully removed from profile.");
  }).catch(function(err)
  {
    console.log(err);
  })
});


// Basically same format as updateUsers
app.get('/updateCompany', function(req, res)
{

});

// Basically same format as updateUsers
app.get('/updateImage', function(req, res)
{

});

app.get('/searchImages', function(req, res)
{

});

// Basically same format as insert user
app.post('/insertImage', function(req, res)
{
  db.query("INSERT INTO images VALUES (null, null, null, null, null, ....)").then(function()
  {

  }).catch(function(err)
  {
    console.log(err);
  })
});

app.get('/loggedout', function(req, res)
{
  req.session.id = "";
  req.session.email = "";
  req.session.password = "";
  req.session.username = "";
  res.redirect('/');
});

app.listen(PORT, function()
{
  console.log("Listening at port 8000");
});
