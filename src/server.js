const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const express = require('express');

const onlineUsers = [];

// Inicia a aplicação com a rota principal '/'
app.get('/', (req, res) => {
    app.use(express.static('./'));
    res.sendFile(path.join(__dirname, '../index.html'));
});

// metodos para a comunicao entre os peers
io.on('connection', (socket) => {

    // enviar mensagens de um cliente para o outro
    socket.on('sendMessage', (message) => {
        io.to(message.receiver).emit('sendMessage', message);
    });

    // recebe um evento de usuário novo online e manda para os outros usuarios
    socket.on('newUser', (user) => {
        const newUser = {id: socket.id, name: user};
        onlineUsers.push(newUser);
        io.to(socket.id).emit('newUser', newUser);
        io.emit('onlineUsers', onlineUsers);
    });

    // quando um usuário desconecta do chat
    socket.on('disconnect', () => {
        onlineUsers.forEach((user, index) => {
            if (user.id === socket.id) {
                onlineUsers.splice(index, 1);
                io.emit('userIsDisconnected', socket.id);
                io.emit('onlineUsers', onlineUsers);
            }
        });
    });

});

// Aplicação rodando na porta 3000
http.listen(3000, () => {
    console.log('server chat peer to peer ouvindo na porta 3000');
});
