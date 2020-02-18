const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql");
const path = require("path");
const request = require("request");

const app = express();
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'transactions',
  multipleStatements: true
});

let incomeItems = ["Checking Balance", "Savings Balance", "Paycheck", "Bonus", "Interest Income", "Other Income"];
let expenseItems = ["Transportation/Work", "Bills", "Debt", "Groceries and Shopping", "Home/Rent", "Entertainment", "Transfer Out", "Other"];
let filteredResults;
let filterType;
let filterDate;

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
  let title = "Personal Finance App";

  let statement = "SELECT id, DATE_FORMAT(date, '%Y-%m-%d') AS date, type, category, description, pmt_method, amount FROM `2020`";
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
  res.render("add", {
    pageTitle: "Personal Finance App: Add Page",
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
  let statement = "SELECT id, DATE_FORMAT(date, '%Y-%m-%d') AS date, type, category, description, pmt_method, amount FROM `2020` WHERE id = " + id;
  let query = connection.query(statement, function(error, result) {
    if (error) console.log(error);
    else {
      res.render("edit", {
        pageTitle: "Personal Finance App: Edit Page",
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

app.get("/balances", function(req, res) {
  let incomeStatement = "SELECT SUM(amount) totalIncome FROM `2020` WHERE type = 'Income';";
  let expenseStatement = "SELECT SUM(amount) totalExpenses FROM `2020` WHERE type = 'Expense';";
  let statements = incomeStatement + " " + expenseStatement;

  let query = connection.query(statements, function(error, result) {
    if (error) console.log(error);
    else {
      res.render("balances", {
        pageTitle: "Personal Finance App: Balances",
        currentBalance: currencyFormat('en-US', 'USD', (result[0][0].totalIncome - result[1][0].totalExpenses)),
        totalIncome: currencyFormat('en-US', 'USD', result[0][0].totalIncome),
        totalExpenses: currencyFormat('en-US', 'USD', result[1][0].totalExpenses)
      });
    }
  });
});

app.get("/filter", function(req, res) {
  res.render("filter", {
    pageTitle: "Personal Finance App: Filter Results Page",
    results: filteredResults,
    date: filterDate,
    type: filterType
  });
});

app.post("/renderResults", function(req, res) {
  let statement = "SELECT SUM(amount) filterResult FROM `2020` WHERE MONTHNAME(date) = '" + req.body.date + "' And type = '" + req.body.type + "'";

  let query = connection.query(statement, function(error, result) {
    if (error) console.log(error);
    else {
      filteredResults = currencyFormat('en-US', 'USD', result[0].filterResult);
      filterType = req.body.type,
      filterDate = req.body.date

      res.redirect("filter");
    }
  });
});


function currencyFormat(locale, currency, number) {
  let formattedNumber = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format((number));
  return formattedNumber;
};
