const path = require("path");
const bcrypt = require("bcryptjs");
const hbs = require("hbs");
const mongoose = require("mongoose");

require("./db/mongoose.js");
const User = require("./models/user");
const Record = require("./models/record");
const app = require("./app");
const { findByIdAndDelete } = require("./models/user");

// -------------- Server -----------------
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
});

// ------------- User Routes -----------------
app.route('/')
  .get(async (req, res) => {
    res.render('index', {
      text: 'Login',
      altLink: 'signup',
      altText: 'Create an account'
    });
  })
  .post(async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const user = await User.findOne({ username });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) res.status(400).send();
      res.redirect('/transactions')
    }

    res.status(404).send();
  })

app.route('/signup')
  .get(async (req, res) => {
    res.render('index', {
      text: 'Signup',
      link: 'signup',
      altText: 'Login to account'
    });
  })
  .post(async (req, res) => {
    const user = new User({
      username: req.body.username,
      password: await bcrypt.hash(req.body.password, 8)
    });

    await user.save()
      .then(res.send(user))
      .catch(e => { res.send(e) });
  })

  // -------------- Transactions Route ---------------

  app.route("/transactions")
  .get(async(req, res) => {
      const records = await Record.find();
      res.render('transactions', {
        text: "Transactions",
        records
      });

  })

// --------------- Record Routes --------------

app.route('/record')
.get(async(req, res) => {
  res.render('record', {text: "Add", methodCall: "post"});
})
.post(async (req, res) => {
  const record = new Record(req.body);
  
  await record.save()
  .then(() => {
    setTimeout(() => {
      res.redirect('/transactions');
    }, 2000)
  })
  .catch(e => res.status(400).send(e));
})

// ---------------- Record Edit and Delete Routes -------------
app.route("/record?id=")
.get(async(req, res) => {
    const record = await Record.findById(req.query.id);
    res.render('record', {
      text: "Edit",
      record,
      methodCall: "patch"
    });
})
.patch(async (req, res) => {
  const id = req.query.id;
  const record = await Record.findByIdAndUpdate(id, req.body, {new: true});
  record
  .then(() => res.redirect('/transactions'))
  .catch(e => res.send(e))
})
.post(async(req, res) => {
  await Record.findByIdAndDelete(req.query.id)
  .then(() => res.redirect('/transactions'))
  .catch(e => res.status(404).send(e));
})
