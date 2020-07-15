const path = require("path");
const express = require("express");
const hbs = require("hbs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

const app = express();

app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '../public')));
app.set('views', path.join(__dirname, '../views'));
hbs.registerPartials(path.join(__dirname, '../views/partials'));

// --------------- Mongoose --------------
mongoose.connect('mongodb://127.0.0.1:27017/budget-app-api', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const userSchema = mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  });

const User = mongoose.model('User', userSchema);

// -------------- Server -----------------
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
});

app.route('/')
.get(async(req, res) => {
  res.render('index', {buttonText: 'Login'});
})
.post(async(req, res) => {
  const username = req.body.username;
  const user = User.findOne({username});

  bcrypt.compare(req.body.password, user.password, (err, res) => {
    if(res) res.send('Logged in');
  });
})

app.route('/signup')
.get(async(req, res) => {
  res.render('index', {
    buttonText: 'Signup',
    actionText: 'signup'
  });
})
.post(async(req, res) => {
  const user = new User({
    username: req.body.username,
    password: await bcrypt.hash(req.body.password, 8)
  });

  user.save()
  .then(res.send(user))
  .catch(e => {res.send(e)});
})
