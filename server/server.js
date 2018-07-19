const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {
    generateMessage,
    generateLocationMessage
} = require('./utils/message');
const {
    isRealString
} = require('./utils/validation');
const {
    Users
} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const users = new Users();

app.use(express.static(publicPath))

io.on('connection', (socket) => {
    console.log('from server: user connected!');

    socket.on('disconnect', () => {
        const user = users.removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left the group`));
        }
    });
    socket.on('createMessage', (message, callback) => {
        const user = users.getUser(socket.id);
        if (user && isRealString(message.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
        }
        callback();
    });
    socket.on('createLocation', (position) => {
        const user = users.getUser(socket.id);
        if (user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, position.latitude, position.longitude));
        }
    })
    socket.on('join', (param, callback) => {
        if (!isRealString(param.name) || !isRealString(param.room)) {
            return callback('Name and Room are required');
        }
        socket.join(param.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, param.name, param.room);
        io.to(param.room).emit('updateUserList', users.getUserList(param.room));
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
        socket.broadcast.to(param.room).emit('newMessage', generateMessage('Admin', 'New user connected!'));

        callback();
    })
});
server.listen(port, () => console.log(`Server is up on port ${port}`));
console.log(publicPath);