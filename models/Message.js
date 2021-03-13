const mongoose = require('mongoose');
const moment = require('moment');

const MessageSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
    },
    text:{
      type: String,
      required: true,
    },
    time:{
      type: String,
      default: moment().format('h:mm a')
    },
    room:{
      type: String,
      required: true
    },
    date:{
      type: String,
      default: moment().format('LL')
    }
  });

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;