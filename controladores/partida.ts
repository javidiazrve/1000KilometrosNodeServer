import { Mazo, Carta } from "../interfaces";
import { Server, Socket } from 'socket.io';
import { Partida } from "../clases/partida";


var partida = (socket: Socket, io: Server) => {

    var partida: Partida;

    //*******************Acciones fuera de juego*******************
    // acciones que no influyen en la partida, pero si en la sala;

    socket.on('sentarse', () => {

        partida = io.sockets.adapter.rooms[socket.room].partida

        partida.sentarse(socket.jugador.nickname);

        if (partida.todosSentados) {
            partida.comenzarPartida(socket);
        }

    })

    socket.on('abandonarPartida', ()=>{

        socket.leave(partida.salaID);
        partida.abandonarPartida(socket.jugador.nickname, socket);

    })

    socket.on('salirSala', () => {

        socket.leave(partida.salaID);

    })

    //******************* FIN Acciones fuera de juego*******************


    //******************* JUGADAS **************************************
    // acciones dentro del juego que influyen en la partida

    socket.on('jugarCarta', (carta: Carta, para: string) => {

        console.log('jugada: ',carta.tipo);
        
        switch (carta.tipo) {
            case 'Kilometraje':
                partida.jugarKilometro(carta, socket.jugador.nickname, socket);
                break;
            case 'Ataque':
                partida.jugarAtaque(carta, socket.jugador.nickname, para, socket);
                break;
            case 'Defensa':
                partida.jugarDefensa(carta, socket.jugador.nickname, socket);
                break;
            case 'Escudo':
                partida.jugarEscudo(carta, socket.jugador.nickname, socket);
                break;
        }


    })

    socket.on('pasar', () => {

        partida.pasar(socket);

    })

    socket.on('tomarCarta', () => {

        partida.tomarCarta(socket);

    })

    //******************* FIN DE JUGADAS **************************************

}

module.exports = partida;