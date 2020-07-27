import express from "express";
import socketIO from "socket.io";
import { Jugador } from "./clases/jugador";
import { Sala } from "./clases/sala";

const app = express();

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, ()=> {

    console.log(`server escuchando en puerto: ${PORT}`);

})

var conteoSala = 2000;

const io = require('socket.io').listen(server);

var listaRooms = io.sockets.adapter.rooms;

io.on('connection', (socket: any) => {

    var sala: Sala;

    var jugador: Jugador;

    console.log('new connection');
    
    socket.on('crearSala', (data:any) => {
        
        jugador = new Jugador(data.nickname);
        
        socket.join(conteoSala.toString());

        const salaModelo = {
            id: conteoSala,
            admin: data.nickname,
            jugadores: [jugador]
        }

        listaRooms[conteoSala.toString()].sala = new Sala(salaModelo);
        
        sala = listaRooms[conteoSala.toString()].sala;
        
        socket.emit('entre', sala);

        conteoSala++;

    })

    socket.on('joinSala', (data:any)=> {

        jugador = new Jugador(data.nickname);

        socket.join(data.sala);

        listaRooms[data.sala].sala.jugadores.push(jugador);

        sala = listaRooms[data.sala].sala;

        socket.emit('entre', sala)

        socket.to(sala.id).emit('newPlayer', {room: sala, player: data.nickname});

    })

    socket.on('abandonarSala', ()=>{

        sacarJugador(jugador.nickname);

        socket.to(sala.id).emit('playerLeft', {room: sala, player: jugador.nickname});
        
        socket.leave(sala.id);

        console.log(listaRooms);

    })

    socket.on('ready', (jugador:any) => {

        listaRooms[sala.id].sala.getReady(jugador);

        socket.emit('listos', {room: listaRooms[sala.id].sala});
        socket.to(sala.id).emit('listos', {room: listaRooms[sala.id].sala});

    });

    function sacarJugador(nickname: string){

        if(listaRooms[sala.id].sala.jugadores.length > 1){
        
            listaRooms[sala.id].sala.jugadores.splice(listaRooms[sala.id].sala.jugadores.findIndex((el:any) => el.nickname === nickname),1);
        
        }
        
    }

})