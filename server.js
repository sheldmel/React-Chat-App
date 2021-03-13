const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const messageModel = require('./models/Message')
const moment = require('moment');

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');
const mongoose = require('mongoose');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
mongoose.connect('mongodb+srv://Shelton:test123@cluster0.qusgr.mongodb.net/Full-Stack?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chat Bot';

// Run when client connects
io.on('connection', socket => {

  socket.on('typing',function(data){
    const user = getCurrentUser(socket.id);
    socket.broadcast.to(user.room).emit("typing",data)
  })
  socket.on('joinRoom', ({ username, room }) => {
    messageModel.find({}, (err,messages)=>{
      messages.forEach(message => {
       socket.emit("message",formatMessage(message.username, message.text, message.time, message.date))
      });
     }).where('room').equals(room).sort({'date': -1,'time':1})
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    // Welcome current user
    //socket.emit('message', formatMessage(botName, 'Welcome to Chat!',moment().format('h:mm a'),moment().format('LL')))
    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`,moment().format('h:mm a'),moment().format('LL')));

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    messageModel.insertMany({username: user.username, text: msg, room: user.room, time: moment().format('h:mm a'), date: moment().format('LL')})
    io.to(user.room).emit('message', formatMessage(user.username, msg,moment().format('h:mm a'),moment().format('LL')));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`,moment().format('h:mm a'),moment().format('LL'))
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


