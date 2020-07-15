const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql");
const path = require("path");

const cat = require(__dirname + "/public/js/categories.js");
const format = require(__dirname + "/public/js/format.js")

const app = express();
app.set("view engine", "ejs");
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: '104.154.221.161',
  user: 'root',
  password: '104Percent%',
  database: 'transactions',
  multipleStatements: true
});

// filter variables Remember
let filteredResults;
let filterType;
let filterDate;

//--------------------index Route--------------------
app.route("/")
  .get(function(req, res) {
    let incomeStatement = "SELECT SUM(amount) totalIncome FROM `2020` WHERE type = 'Income';";
    let expenseStatement = "SELECT SUM(amount) totalExpenses FROM `2020` WHERE type = 'Expense';";
    let statements = incomeStatement + " " + expenseStatement;

    let query = connection.query(statements, function(error, result) {
      if (error) console.log(error);
      else {
        res.render("index", {
          pageTitle: "Personal Finance App",
          currentBalance: format.getUsCurrency((result[0][0].totalIncome - result[1][0].totalExpenses)),
          totalIncome: format.getUsCurrency(result[0][0].totalIncome),
          totalExpenses: format.getUsCurrency(result[1][0].totalExpenses)
        });
      }
    });
  });

//--------------------transactions Route--------------------

app.route("/transactions")
  .get(function(req, res) {
    let statement = "SELECT id, DATE_FORMAT(date, '%Y-%m-%d') AS date, type, category, description, pmt_method, amount FROM `2020`";
    let query = connection.query(statement, function(error, rows) {
      if (error) console.log(error);
      else {
        res.render("transactions", {
          pageTitle: "Personal Finance App: Transactions",
          records: rows
        });
      }
    });
  });

//--------------------Add Route--------------------
app.route("/add")
  .get(function(req, res) {
    res.render("add", {
      pageTitle: "Personal Finance App: Add"
    });
  })
  .post(function(req, res) {
    let data = {
      date: req.body.date,
      type: req.body.type,
      category: req.body.category,
      description: req.body.description,
      pmt_method: req.body.pmt_method,
      amount: req.body.amount,
    };

    let statement = "INSERT INTO `2020` SET ?";
    let query = connection.query(statement, data, function(err, results) {
      if (!err) {
        res.redirect("/");
      } else {
        res.send(err);
      }
    });
  });

//--------------------edit Route--------------------
app.route("/edit")
  .get(function(req, res) {
    const id = req.query.id;

    let statement = "SELECT id, DATE_FORMAT(date, '%Y-%m-%d') AS date, type, category, description, pmt_method, amount FROM `2020` WHERE id = " + id;

    let query = connection.query(statement, function(error, result) {
      if (error) console.log(error);
      else {
        res.render("edit", {
          pageTitle: "Personal Finance App: Edit",
          records: result[0],
        });
      }
    });
  })
  .post(function(req, res) {

    let statement = "UPDATE `2020` SET date='" + req.body.date + "', type='" + req.body.type +
      "', category='" + req.body.category + "', description='" +
      req.body.description + "', pmt_method='" + req.body.pmt_method +
      "', amount='" + req.body.amount + "' where id =" + req.body.id;

    let query = connection.query(statement, function(error, result) {
      if (!error) res.redirect("/");
      else res.send(error);
    });
  });

//--------------------delete Route--------------------
app.get("/delete", function(req, res) {
  const id = req.query.id;
  let statement = "DELETE FROM `2020` WHERE id = " + id;
  let query = connection.query(statement, function(error, result) {
    if (!error) res.redirect("/transactions");
    else res.send(error);
  });
});

//---------------------filter seciont-------------------
app.get("/filter", function(req, res) {
  res.render("filter", {
    pageTitle: "Personal Finance App: Filter",
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
      filteredResults = format.getUsCurrency(result[0].filterResult);
      filterType = req.body.type,
        filterDate = req.body.date

      res.redirect("filter");
    }
  });
});

//-------------------Port Section-------------------
const PORT = process.env.PORT;

app.listen(PORT, function() {
  console.log("Server started on port " + PORT);
});
