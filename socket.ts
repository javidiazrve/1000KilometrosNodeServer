import * as io from 'socket.io';

var i = io;

var Socket = (server:any) => {

    let io = i.listen(server);

    io.on('connection', socket => {

        console.log('new Connection');

        let lobby = require('./controladores/lobby')(socket, io);

        var partida = require('./controladores/partida')(socket,io);
    });

}

module.exports = Socket;