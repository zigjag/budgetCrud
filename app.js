const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql");
const path = require("path");

const app = express();
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'transactions',
});

let incomeItems = ["Checking Balance", "Savings Balance", "Paycheck", "Bonus", "Interest Income", "Other Income"];
let expenseItems = ["Transportation/Work", "Bills", "Debt", "Groceries and Shopping", "Home/Rent", "Entertainment", "Transfer Out", "Other"];

connection.connect(function(error) {
  if (error) console.log(error);
  else console.log("Database Connected.");
});

app.set("view engine", "ejs");
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
// app.set('views',path.join(__dirname,'views'));

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

app.get("/", function(req, res) {
  let title = "Budget App";

  let statement = "SELECT * FROM `2020`";
  let query = connection.query(statement, function(error, rows) {
    if (error) console.log(error);
    else {
      res.render("index", {
        pageTitle: title,
        records: rows
      });
    }
  });
});

app.get("/add", function(req, res) {
  let title = "Budget App: Add Page";

  res.render("add", {
    pageTitle: title,
    incomeItems: incomeItems,
    expenseItems: expenseItems
  });
});

app.post("/save", function(req, res) {
  let data = {
    date: req.body.date,
    type: req.body.type,
    category: req.body.category,
    description: req.body.description,
    pmt_method: req.body.pmt_method,
    amount: req.body.amount,
  };

  let statement = "INSERT INTO `2020` SET ?";
  let query = connection.query(statement, data, function(error, results) {
    if (error) console.log(error);
    else res.redirect("/")
  });
});

app.get("/edit", function(req, res) {
  const id = req.query.id;
  let statement = "SELECT * FROM `2020` WHERE id = " + id;
  let query = connection.query(statement, function(error, result) {
    if (error) console.log(error);
    else {
      res.render("edit", {
        pageTitle: "Budget App: Edit Page",
        records: result[0],
        date: JSON.stringify(result[0].date).substring(1, 11),
        incomeItems: incomeItems,
        expenseItems: expenseItems
      });
    }
  });
});

app.post("/update", function(req, res) {
  const id = req.body.id;
  let statement = "UPDATE `2020` SET date='" + req.body.date + "', type='" + req.body.type + "', category='" + req.body.category + "', description='" + req.body.description + "', pmt_method='" + req.body.pmt_method + "', amount='" + req.body.amount + "' where id =" + id;
  let query = connection.query(statement, function(error, result) {
    if (error) console.log(error);
    res.redirect("/");
  });
});

app.get("/delete", function(req, res) {
  const id = req.query.id;
  let statement = "DELETE FROM `2020` WHERE id = " + id;
  let query = connection.query(statement, function(error, result) {
    if (error) console.log(error);
    else {
      res.redirect("/");
    }
  });
});

app.get("/balance", function(req, res) {
  let statement = "SELECT SUM(amount) AS balance FROM `2020`";
  let query = connection.query(statement, function(error, result){
    if (error) console.log(error);
    else {
      res.send("Current balance is " + result[0].balance);
    }
  });
});
