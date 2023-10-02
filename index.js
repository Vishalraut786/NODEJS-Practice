const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4} = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: 'Pass@909'
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
    faker.date.past(),
  ]
};



//HOME PAGE
app.get("/", (req, res) => {
  let q = `SELECT count(*) from user;`
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send("some error in DB");
  }
});

//SHOW USER
app.get("/user", (req, res) => {
  let q = `SELECT * from user`;

  try {
    connection.query(q, (err, users) => {
      if (err) throw err;

      //res.send(result);
      res.render("showuser.ejs", { users });
    });
  } catch (err) {
    console.log(err);
    res.send("some error in DB");
  }
});

//EDIT ROUTE

app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id ='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("some error in DB");
  }

});

//UPDATE (DB ROUTE)

app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let {password:formpass,username:newUsername}= req.body;
  let q = `SELECT * FROM user WHERE id ='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
 
      if(formpass !== user.PASSWORD ){
        res.send("Wrong password");
        return;
      }else{
        let q2=`UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
        connection.query(q2, (err, result) =>{
          if (err) throw err;
          res.redirect("/user");
          
        });
      }
     // res.send(user);
    });
  } catch (err) {
    console.log(err);
    res.send("some error in DB");
  }

});

//add user
app.get("/user/new", (req,res)=>{
  res.render("new.ejs");
});
app.post("/user/new",(req,res)=>{
let { username, email, password, times } =req.body;
let id =uuidv4();
//Query to Insert New User
let q =`INSERT INTO user (id,username,email,password,times) VALUES ('${id}','${username}','${email}','${password}','${times}')`;

try {
  connection.query(q, (err, result) => {
    if (err) throw err;
    console.log("added new user");
    res.redirect("/user");
  });
} catch (err) {
  console.log(err);
  res.send("some error in DB");
}

});

//Delete user

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});



app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});


app.listen("8080", () => {
  console.log("server is listining to port 8080");
});


