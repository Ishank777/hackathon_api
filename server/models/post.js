const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const PostSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  Username: {
    type: String,
    required: true
  },
  Approved: {
    type: String,
    default: "no"
  },
  Summary: {
    type: String,
    default: " ",
  },
  views: {
    type: Number,
    default: 0,
  },
  // ishank
  likesCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Post', PostSchema);