const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required for creating a user"],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please use a valid email address'],
    unique: true
  },
  name: {
    type: String,
    required: [true, "Name is required for creating an account"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minLength: [6, "Password should contain more than 6 length"],
    select: false
  },
  systemUser: {
    type: Boolean,
    default: false,
    immutable: true,
    select: false
  }
}, {
  timestamps: true
});

userSchema.pre("save", async function(next) {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function(password) {
  return  bcrypt.compare(password, this.password);
};

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;





