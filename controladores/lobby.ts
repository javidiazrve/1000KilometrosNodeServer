
import {conteoSala, listaRooms} from '../index'
import { Sala } from '../clases/sala';
import { Jugador } from '../clases/jugador';

var lobby = (socket, io) => {

    var sala: Sala;

    var jugador: Jugador;
    
    socket.on('crearSala', (data:any) => {
        
        jugador = new Jugador(data.nickname);
        
        socket.join(this.conteoSala.toString());

        const salaModelo = {
            id: this.conteoSala,
            admin: data.nickname,
            jugadores: [jugador]
        }

        listaRooms[this.this.conteoSala.toString()].sala = new Sala(salaModelo);
        
        sala = listaRooms[this.conteoSala.toString()].sala;
        
        socket.emit('entre', sala);

        this.this.conteoSala++;

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
            
            if(listaRooms[sala.id].sala.)
        }
        
    }

}

module.exports = lobby;