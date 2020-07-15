const path = require("path");
const express = require("express");
const bcrypt = require("bcryptjs");

require("./db/mongoose.js");
const User = require("./models/user")
const app = require("./app")

// -------------- Server -----------------
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
});

app.route('/')
.get(async(req, res) => {
  res.render('index', {
    text: 'Login',
    altLink: 'signup',
    altText: 'Create an account'});
})
.post(async(req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = await User.findOne({username});

  if(user){
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) res.status(400).send('Unable to login');
    return res.render('transactions', {text: "Transactions"});
  }

  return res.status(404).send('User does not exist')
})

app.route('/signup')
.get(async(req, res) => {
  res.render('index', {
    text: 'Signup',
    link: 'signup',
    altText: 'Login to account'
  });
})
.post(async(req, res) => {
  const user = new User({
    username: req.body.username,
    password: await bcrypt.hash(req.body.password, 8)
  });

  await user.save()
  .then(res.send(user))
  .catch(e => {res.send(e)});
})
