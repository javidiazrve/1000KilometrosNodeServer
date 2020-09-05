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

    socket.on('crearSala', (nickname:string) => {
        
        const salaID = sala.toString();
        sala = sala + 1;

        jugadorActual = new Jugador(nickname);
        socket.jugador = jugadorActual;
        socket.room = salaID;
        socket.join(salaID);
        
        salaActual = new Sala({
            id: salaID,
            admin: jugadorActual.nickname,
            jugadores: [jugadorActual]
        });
        
        rooms[salaID].sala = salaActual;

        socket.emit('nueva-sala', {sala: salaActual, jugador: jugadorActual});

    })

    socket.on('joinSala', (data: any) => {

        jugadorActual = new Jugador(data.nickname);
        socket.jugador = jugadorActual;
        socket.join(data.id);
        socket.room = data.id;

        salaActual = rooms[data.id].sala;
        salaActual.nuevoJugador(jugadorActual, socket);

    })

    socket.on('validar-sala', (room: any, jugador: string)=>{

        var existe = false;

        if(rooms[room]){
            existe = true;
            var jug = rooms[room].sala.jugadores.find(j => j.nickname === jugador);
            var full = rooms[room].sala.jugadores.length === 5;
            var ocupado = false;
            if(jug){
                ocupado = true;
            }
            socket.emit('sala-validada', {existe: true, ocupado, full});
        }else{
            socket.emit('sala-validada', {existe: false});
        }

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