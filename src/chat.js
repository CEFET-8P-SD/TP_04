const socket = io();
const allChatMessages = [];
const chatNotificationCount = [];
let myUser = {};
const myFriend = {};

// Função principal quando a pagina é carregada
$(document).ready(() => {
    loginMe();
});

// Método para o usuário escrever seu nome e ser estar online para conversar
function loginMe() {
    const person = prompt('Por favor entre com seu nome:', 'Seu nome');

    // validar o nome do usuario cadastrado usando somente letras
    if (/([^\s])/.test(person) && person != null && person !== '') {
        socket.emit('newUser', person);
        document.title = person;
    } else {
        location.reload();
    }
}

// Método para enviar mensagens
function submitMessage() {
    const message = {};
    // pega valor da tag html e atribui para text
    let text = $('#writeMessage').val();

    if (text !== '') {
        message.text = text;
        message.sender = myUser.id;
        message.receiver = myFriend.id;

        // adiciona a mensagem na lista de mensagens
        $('#messages').append('<li class="chatMessageRight">' + message.text + '</li>');

        if (allChatMessages[myFriend.id] !== undefined) {
            allChatMessages[myFriend.id].push(message);
        } else {
            allChatMessages[myFriend.id] = new Array(message);
        }
        socket.emit('sendMessage', message);
    }

    // limpa a área de escrita do texto e marca o cursor de escrita
    $('#writeMessage').val('').focus();
    return false;
}

// Carrega todas as mensagens de um usuário
function loadChatBox(messages) {
    $('#messages').html('');
    messages.forEach(function (message) {
        const cssClass = (message.sender === myUser.id) ? 'chatMessageRight' : 'chatMessageLeft';
        $('#messages').append('<li class="' + cssClass + '">' + message.text + '</li>');
    });
}

// Adciona uma mensagem simples ao chat
function appendChatMessage(message) {
    if (message.receiver === myUser.id && message.sender === myFriend.id) {
        const cssClass = (message.sender === myUser.id) ? 'chatMessageRight' : 'chatMessageLeft';
        $('#messages').append('<li class="' + cssClass + '">' + message.text + '</li>');
    } else {
        updateChatNotificationCount(message.sender);
    }

    if (allChatMessages[message.sender] !== undefined) {
        allChatMessages[message.sender].push(message);
    } else {
        allChatMessages[message.sender] = new Array(message);
    }
}

// Função para atualizar o contador de notificacao
function updateChatNotificationCount(userId) {
    const count = (chatNotificationCount[userId] === undefined) ? 1 : chatNotificationCount[userId] + 1;
    chatNotificationCount[userId] = count;
    $('#' + userId + ' label.chatNotificationCount').html(count).show();
}

// Função para limpar o contador de mensagem para zero
function clearChatNotificationCount(userId) {
    chatNotificationCount[userId] = 0;
    $('#' + userId + ' label.chatNotificationCount').hide();
}

// Função para selecionar um usuário da lista de usuários online
function selectUserChatBox(element, userId, userName) {
    myFriend.id = userId;
    myFriend.name = userName;

    $('#form').show();
    $('#messages').show();
    $('#friendName').html(myFriend.name);
    $('#onlineUsers li').removeClass('active');
    $(element).addClass('active');
    $('#writeMessage').val('').focus();

    // limpa o contador de mensagem não lidas
    clearChatNotificationCount(userId);

    // Carrega todas as mensagens de um usuário
    if (allChatMessages[userId] !== undefined) {
        loadChatBox(allChatMessages[userId]);
    } else {
        $('#messages').html('');
    }
}

// Função para setar um novo usuário como usuário atual
socket.on('newUser', function (newUser) {
    myUser = newUser;
    $('#myName').html(myUser.name);
});

// Função para atualizar a lista de todos os usuarios online
socket.on('onlineUsers', function (onlineUsers) {
    let usersList = '';

    if (onlineUsers.length === 2) {
        onlineUsers.forEach(function (user) {
            if (myUser.id !== user.id) {
                myFriend.id = user.id;
                myFriend.name = user.name;
                $('#form').show();
                $('#messages').show();
            }
        });
    }

    onlineUsers.forEach(function (user) {
        if (user.id !== myUser.id) {
            const activeClass = (user.id === myFriend.id) ? 'active' : '';
            usersList += '<li id="' + user.id + '" class="' + activeClass + '" onclick="selectUserChatBox(this, \'' + user.id + '\', \'' + user.name + '\')"><a href="javascript:void(0)">' + user.name + '</a><label class="chatNotificationCount"></label></li>';
        }
    });
    $('#onlineUsers').html(usersList);
});

// Função que recebe uma mensagem enviada por um amigo
socket.on('sendMessage', function (message) {
    appendChatMessage(message);
});

// Apaga o historico de conversa no chat quando a pessoa disconecta
socket.on('userIsDisconnected', function (userId) {
    delete allChatMessages[userId];
    $('#form').hide();
    $('#messages').hide();
});
