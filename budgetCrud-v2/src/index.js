const path = require("path");
const bcrypt = require("bcryptjs");
const hbs = require("hbs");
const mongoose = require("mongoose");
const auth = require('./middleware/auth');

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
    try{
      const user = await User.findOne({ username });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) res.status(400).send();

      const token = await user.generateAuthToken();
      req.header.authorization = token;
      res.redirect('/transactions')
    } catch(e) {
      res.status(400).send();
    }
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
    const user = new User(req.body);

    try{
      await user.save();
      const token = await user.generateAuthToken();
      req.header.authorization = token;
      res.redirect('/transactions');
    } catch(e){
      res.send(e);
    }
  })

  app.route('/logout')
  .post(auth, async(req, res) => {
    try{
      req.user.tokens = [];
      await req.user.save()
      res.redirect('/');
    } catch(e){
      res.status(400).send(e);
    }
  })

  // -------------- Transactions Route ---------------

  app.route("/transactions")
  .get(auth, async(req, res) => {
      const records = await Record.find();
      res.render('transactions', {
        text: "Transactions",
        records
      });

  })

// --------------- Add Record Routes --------------

app.route('/add')
.get(auth, async(req, res) => {
  res.render('record', {
    form_type: "Add",
    form_action: "/add"});
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

// ---------------- Edit Record Routes -------------
app.route("/record")
.get(auth, async(req, res) => {
    const id = req.query.id;
    const record = await Record.findById(req.query.id);

    res.render('record', {
      form_type: "Edit",
      form_action: "/record?id=" + id,
      record
    })
  })
.post(async (req, res) => {
  const id = req.query.id;
  await Record.findByIdAndUpdate(id, req.body, {new: true, useFindAndModify: false})
  .then(() => res.redirect('/transactions'))
  .catch(e => res.send(e))
})

// ----------------- Delete Record ---------------
app.route('/delete')
.post(async(req, res) => {
  await Record.findByIdAndDelete(req.query.id)
  .then(() => res.redirect('/transactions'))
  .catch(e => res.status(404).send(e));
})

// --------------- Balance Routes ------------
app.route('/balance')
.get(auth, async(req, res) => {
  const findTypeMatch = (typeMatch) => {
    return  Record.find({type: typeMatch})
  }
  const income = await findTypeMatch("Income");
  const expense = await findTypeMatch("Expense");

  const aggregate = (items) => {
    let counter = 0;
    items.forEach(item => counter += item.amount);
    return counter;
  }

  const incomeAggregate = aggregate(income);
  const expenseAggregate = aggregate(expense);
  const balance = (incomeAggregate - expenseAggregate)

  res.render('balance', {
    incomeAggregate,
    expenseAggregate,
    balance
  })

})