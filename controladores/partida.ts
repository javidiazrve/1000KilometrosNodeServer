import { Mazo, Carta } from "../interfaces";
import { Server, Socket } from 'socket.io';
import { Partida } from "../clases/partida";


var partida = (socket:Socket, io: Server)=>{

    var partida: Partida;

    //*******************Acciones fuera de juego*******************
    // acciones que no influyen en la partida, pero si en la sala;

    socket.on('sentarse', ()=>{

        partida = io.sockets.adapter.rooms[socket.room].partida

        partida.sentarse(socket.jugador.nickname);

        if(partida.todosSentados){
            partida.comenzarPartida(socket);
        }

    })

    socket.on('salirSala', ()=> {

        socket.leave(partida.salaID);

    })

    //******************* FIN Acciones fuera de juego*******************


    //******************* JUGADAS **************************************
    // acciones dentro del juego que influyen en la partida

    socket.on('jugarKilometros', (carta:Carta)=>{

        partida.jugarKilometro(carta, socket.jugador.nickname, socket);

    })

    socket.on('pasar',()=>{

        partida.pasar(socket);

    })

    socket.on('tomarCarta', ()=> {

        partida.tomarCarta(socket);

    })

    //******************* FIN DE JUGADAS **************************************

}

module.exports = partida;