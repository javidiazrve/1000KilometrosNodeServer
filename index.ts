import express from "express";
import socketIO from "socket.io";
import { Jugador } from "./clases/jugador";
import { Sala } from "./clases/sala";
import * as http from 'http';

const app = express();

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = require('socket.io')(server);

export var conteoSala = 2000;
export var listaRooms = io.sockets.adapter.rooms;

io.on('connection', (socket: any) => {
    console.log('new connection');

    var lobby = require('./controladores/lobby')(socket);

})

server.listen(PORT, ()=> {

    console.log(`server escuchando en puerto: ${PORT}`);

})