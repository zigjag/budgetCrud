const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
  }, {
    timestamps: true
  });

  // userSchema.methods.toJSON = function () {
  //   const user = this;
  //   const userObject = user.toObject();

  //   delete userObject.password;
  //   delete userObject.tokens;

  //   return userObject;
  // }


  userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id: user.id.toString()}, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({token: token});

    await user.save();
    return token;
  }

  userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
      user.password = await bcrypt.hash(user.password, 8);
    }
    next();
  })

const User = mongoose.model('User', userSchema);

module.exports = User;
