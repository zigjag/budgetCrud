const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ]
  });

  userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id: user.id.toString()}, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({token: token});

    await user.save();
    return token;
  }

const User = mongoose.model('User', userSchema);

module.exports = User;
