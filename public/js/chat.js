var socket = io();
const scrollToBottom = () => {
    const messages = document.querySelector('#messages');
    messages.scrollTop = messages.scrollHeight - messages.clientHeight;
}
socket.on('connect', () => {
    socket.emit('join', $.deparam(), (err) => {
        if (err) {
            alert(err);
            window.location.href = '/';
        } else {
            console.log('No error');
        }
    });
});
socket.on('disconnect', () => {
    console.log('from client: disconnected from server')
});
socket.on('updateUserList', (users) => {
    console.log('Users list', users);
    document.querySelector('#users').innerHTML = '';
    const ol = document.createElement('ol');
    users.forEach((user) => {
        const li = document.createElement('li');
        li.textContent = user;
        ol.appendChild(li);
    });
    document.querySelector('#users').appendChild(ol);
});
socket.on('newMessage', (message) => {
    const messages = document.querySelector('#messages');
    console.log('Scroll Top', messages.scrollTop);
    let template = document.querySelector('#message-template').innerHTML;
    let html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: message.createdAt
    });
    document.querySelector('#messages').insertAdjacentHTML('beforeend', html);
    scrollToBottom();
});
socket.on('newLocationMessage', (message) => {
    let template = document.querySelector('#location-message-template').innerHTML;
    let html = Mustache.render(template, {
        url: message.url,
        from: message.from,
        createdAt: message.createdAt
    });
    document.querySelector('#messages').insertAdjacentHTML('beforeend', html);
})

document.querySelector('#message-form').addEventListener('submit', function (e) {
    e.preventDefault();
    socket.emit('createMessage', {
        from: 'User',
        text: document.querySelector('#message').value
    }, function () {});
    document.querySelector('#message').value = '';
    // scrollToBottom();
});
document.querySelector('#send-location').addEventListener('click', function (e) {
    if (!navigator.geolocation) {
        return alert('your browser does not support location');
    }
    document.querySelector('#send-location').setAttribute('disabled', 'disabled');
    document.querySelector('#send-location').textContent = 'Sending location...';
    navigator.geolocation.getCurrentPosition((position) => {
        document.querySelector('#send-location').removeAttribute('disabled');
        document.querySelector('#send-location').textContent = 'Send location';
        socket.emit('createLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, (error) => {
        alert('Unable to fetch location')
        document.querySelector('#send-location').removeAttribute('disabled');
        document.querySelector('#send-location').textContent = 'Send location';
    });
});