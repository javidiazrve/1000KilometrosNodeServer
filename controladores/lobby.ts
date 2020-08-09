import { Sala } from '../clases/sala';
import { Server, Socket } from 'socket.io';
import { Jugador } from '../clases/jugador';
import { Partida } from '../clases/partida';

var sala = 2000;

var Lobby = (socket: Socket, io: Server) => {

    var rooms = io.sockets.adapter.rooms;
    var salaActual: Sala;
    var jugadorActual: Jugador;

    //************** ACCIONES FUERA DE SALA **************

    socket.on('crearSala', (data:any) => {
        
        const salaID = sala.toString();
        sala = sala + 1;

        jugadorActual = new Jugador(data.nickname);
        socket.jugador = jugadorActual;
        socket.room = salaID;
        socket.join(salaID);
        
        salaActual = new Sala({
            id: salaID,
            admin: jugadorActual.nickname,
            jugadores: [jugadorActual]
        });
        
        rooms[salaID].sala = salaActual;

        socket.emit('nueva-sala', salaActual);

    })

    socket.on('joinSala', (data: any) => {

        jugadorActual = new Jugador(data.nickname);
        socket.jugador = jugadorActual;
        socket.room = data.sala;
        socket.join(data.sala);

        salaActual = rooms[data.sala].sala;

        salaActual.nuevoJugador(jugadorActual, socket);

    })

    socket.on('validar-sala', (room: any)=>{

        var existe = false;

        if(rooms[room]){
            existe = true;
        }else{
            existe = false;
        }

        socket.emit('sala-validada', {existe: existe});

    })

    //************** FIN FUERA DE SALA **************

    //************** ACCIONES DENTRO DE SALA **************

    
    socket.on('ready', function () {
        
        salaActual.listo(jugadorActual.nickname, socket);
        
    })
    
    socket.on('empezarPartida', ()=>{
        
        io.sockets.adapter.rooms[salaActual.id].partida = new Partida({
            id: io.sockets.adapter.rooms[salaActual.id].sala.id,
            jugadores: io.sockets.adapter.rooms[salaActual.id].sala.jugadores
        })
        
        salaActual.irMesa(socket);
        
    })
    
    socket.on('abandonarSala', function () {

        salaActual.dejarSala(jugadorActual.nickname, socket);

    })

}

module.exports = Lobby;