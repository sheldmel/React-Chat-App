const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const message = document.getElementById('msg');
const typingMessage = document.querySelector('.typing')


const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();


socket.emit('joinRoom', { username, room });

socket.on('typing',function(data){
  typingMessage.innerHTML = `${data} is typing......`
})

socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});


socket.on('message', message => {
  console.log(message);
  outputMessage(message);
  typingMessage.innerHTML = ``
  chatMessages.scrollTop = chatMessages.scrollHeight;
});


chatForm.addEventListener('submit', e => {
  e.preventDefault();


  let msg = e.target.elements.msg.value;
  
  msg = msg.trim();
  
  if (!msg){
    return false;
  }


  socket.emit('chatMessage', msg);


  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span> ${message.time} ${message.date}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}


function outputRoomName(room) {
  roomName.innerText = room;
}


function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach(user=>{
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
 }

 msg.addEventListener("keypress",function(){
  socket.emit("typing",username)
 })