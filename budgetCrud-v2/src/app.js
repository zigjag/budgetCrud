const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const hbs = require("hbs");

const app = express();

app.use(express.json());

app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '../public/')));
app.set('views', path.join(__dirname, '../views'));
hbs.registerPartials(path.join(__dirname, '../views/partials'));

module.exports = app;
