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
  if (req.session.id)
  {
    var companyId = req.params.id;

    db.query("SELECT * FROM images WHERE company_id = $1", [companyId]).then(function(data)
    {
      res.send(data);
    }).catch(function(err)
    {
      console.log(err);
    });
  }
  else
  {
    res.send("No access");
  }
});

app.get('/company/:id', function(req, res)
{
  if (req.session.id)
  {
    db.query("SELECT * FROM company WHERE id = $1", [req.params.id]).then(function(data)
    {
      res.send(data);
    }).catch(function(err)
    {
      console.log(err);
    });
  }
  else
  {
    res.send("No access");
  }
});

app.get('/images/:id', function(req, res)
{
  if (req.session.id)
  {
    db.query("SELECT * FROM images WHERE id = $1", [req.params.id]).then(function(data)
    {
      res.send(data);
    }).catch(function(err)
    {
      console.log(err);
    });
  }
  else
  {
    res.send("No access");
  }
});

app.get('/profile/:id', function(req, res)
{
  if (req.session.id)
  {
    db.query("SELECT * FROM users WHERE id = $1", [req.params.id]).then(function(data)
    {
      res.send(data);
    }).catch(function(err)
    {
      console.log(err);
    });
  }
  else
  {
    res.send("No access");
  }
});

app.post('/registerUser', function(req, res)
{
  if (req.session.id)
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
    });
  }
  else
  {
    res.send("No access");
  }
});

app.post('/registerCompany', function(req, res)
{
  if (req.session.id)
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
  }
  else
  {
    res.send("No access");
  }
});

app.get('/companies', function(req, res)
{
  if (req.session.id)
  {
    db.query("SELECT * FROM user_company WHERE user_id = $1", [req.session.id]).then(function(data)
    {
      res.send(data);
    }).catch(function(err)
    {
      console.log(err);
    });
  }
  else
  {
    res.send("No access");
  }
});

app.get('/confirmLink', function(req, res)
{
  res.send("Link to confirm your email");
});

app.post('/deleteImage/:id', function(req, res)
{
  if (req.session.id)
  {
    var id = req.params.id;

    db.query("DELETE FROM images WHERE id = $1", [id]).then(function()
    {
      res.redirect('/images');
    }).catch(function(err)
    {
      console.log(err);
    });
  }
  else
  {
    res.send("No access");
  }
});

app.get('/deactivate/:id', function(req, res)
{
  if (req.session.id)
  {
    db.query("UPDATE users SET active = false WHERE id = $1", [req.params.id]);
    res.send("Your account is now deactivated.");
  }
  else
  {
    res.send("Your account is already deactivated or you have no access.");
  }
});

app.get('/updateUser', function(req, res)
{
  if (req.session.id)
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
  }
  else
  {
    res.send("Your account is already deactivated or you have no access.");
  }
});

app.post('/addCompany', function(req, res)
{
  if (req.session.id)
  {
    db.query("INSERT INTO user_company VALUES ($1, $2)", [req.session.id, req.body.companyId]).then(function()
    {
      res.send("Company was successfully added to profile.");
    }).catch(function(err)
    {
      console.log(err);
    });
  }
  else
  {
    res.send("Your account is already deactivated or you have no access.");
  }
});

app.post('/removeCompany', function(req, res)
{
  if (req.session.id)
  {
    db.query("DELETE FROM user_company WHERE user_id = $1 AND company_id = $2", [req.session.id, req.body.companyId]).then(function()
    {
      res.send("Company successfully removed from profile.");
    }).catch(function(err)
    {
      console.log(err);
    })
  }
  else
  {
    res.send("Your account is already deactivated or you have no access.");
  }
});


// Basically same format as updateUsers
app.get('/updateCompany/:id', function(req, res)
{
  if (req.session.id)
  {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    db.query("UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4", [name, email, password, req.params.id]).then(function()
    {
      res.send("Company info updated");
    }).catch(function(err)
    {
      console.log(err);
    });
  }
  else
  {
    res.send("Your account is already deactivated or you have no access.");
  }
});

// Basically same format as updateUsers
app.post('/updateImage', function(req, res)
{
  if (req.session.id)
  {
    var distance = req.body.distance;
    var px_width = req.body.px_width;
    var px_height = req.body.px_height;
    var real_width = req.body.real_width;
    var real_height = req.body.real_height;
    var img_width = req.body.img_width;
    var img_height = req.body.img_height;
    var offset_x = req.body.offset_x;
    var offset_y = req.body.offset_y;
    var date_modified = new Date();
    var note = req.body.note;

    db.query("UPDATE images SET distance = $1, px_width = $2, px_height = $3, real_width = $4, \
      real_height = $5, img_width = $6, img_height = $7, offsetX = $8, offsetY = $9,  \
       date_modified = $10, note = $11"), [distance, px_width, px_height, real_width, real_height, img_width,
         img_height, offset_x, offset_y, date_modified, note]).then(function()
    {
      res.send("Image info updated");
    }).catch(function(err)
    {
      console.log(err);
    });
  }
  else
  {
    res.send("Your account is already deactivated or you have no access.");
  }
});

app.get('/searchImages/:tag_id/:companyId', function(req, res)
{
  if (req.session.id)
  {
    var date = req.body.date;
    var lower_limit = req.body.lower;
    var upper_limit = req.body.upper;

    db.query("SELECT * FROM images WHERE (tag_id = $1) AND (date = $2) AND (company_id = $3) AND (real_width >= $4 AND real_width <= $5) AND (real_height >= $6 AND real_height <= $7)",
      [req.params.id, date, req.params.companyId, lower_limit, upper_limit, lower_limit, upper_limit ]).then(function()
    {

    }).catch(function(err)
    {
      console.log(err);
    });
  }
  else
  {
    res.send("Your account is already deactivated or you have no access.");
  }
});

// Basically same format as insert user
app.post('/insertImage', function(req, res)
{
  if (req.session.id)
  {
    var distance = req.body.distance;
    var px_width = req.body.px_width;
    var px_height = req.body.px_height;
    var real_width = req.body.real_width;
    var real_height = req.body.real_height;
    var img_width = req.body.img_width;
    var img_height = req.body.img_height;
    var offset_x = req.body.offset_x;
    var offset_y = req.body.offset_y;
    var date_modified = new Date();
    var note = req.body.note;

    db.query("INSERT INTO images (distance, px_width, px_height, real_width, real_height, img_width, img_height, offsetX, offsetY, date_created, note) VALUES \
        ($1, $2, $3, $4, $5, $6, $7, $8, now(), $9, $10)"), [distance, px_width, px_height, real_width, real_height, img_width,
         img_height, offset_x, offset_y, note]).then(function()
    {
      res.send("Image inserted");
    }).catch(function(err)
    {
      console.log(err);
    });
  }
  else
  {
    res.send("Your account is already deactivated or you have no access.");
  }
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
