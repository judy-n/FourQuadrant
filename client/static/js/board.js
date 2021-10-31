const socket = io()
socket.emit('connected to', window.location.href.split('/')[3])