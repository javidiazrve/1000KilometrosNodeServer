import { Sala } from "./sala";
import { Jugador } from './jugador';
import { Socket } from "socket.io";
import { Server } from "socket.io";
import { Mazo, Carta } from "../interfaces";

export class Partida {

    salaID: string;
    jugadores: Jugador[];
    turnoActual?: Jugador;
    todosSentados: boolean;
    mazoPrincipal: Carta[];
    mazoPozo: Carta[];

    constructor(partida: any) {
        this.salaID = partida.id;
        this.jugadores = partida.jugadores;
        this.todosSentados = false;
        this.mazoPrincipal = [];
        this.mazoPozo = [];
    }

    
    //******************* ACCIONES FUERA DE JUEGO *******************
    // acciones que no influyen en la partida, pero si en la sala;
    
    // Funcion para emitir a todos algo
    emit(funcion: string, data: any, socket: Socket) {
        socket.broadcast.to(this.salaID).emit(funcion, data);
        socket.emit(funcion, data);
    }

    // Se llama para declarar que el jugador esta sentado y listo para comenzar
    // esta funcion se llama automaticamente cuando el jugador entra a la vista Sala en el cliente
    sentarse(jugador: string) {

        let sentados = 0;

        // se busca el jugador y se declara su propiedad sentado como true;
        this.jugadores.forEach(j => {

            if (j.nickname === jugador) {
                j.sentado = true;
            }

            if (j.sentado) {
                sentados++;
            }

        })

        // todosSentados se utiliza para saber si todos estan sentados al comparar el contador sentados con el length de los jugadores
        // si son iguales significa que todos estan sentados
        this.todosSentados = sentados === this.jugadores.length;

    }

    // Devuelve la informacion necesaria de pa partida
    getPartida() {

        return {
            salaID: this.salaID,
            jugadores: this.jugadores,
            turnoActual: this.turnoActual,
            mazoPrincipal: this.mazoPrincipal,
            mazoPozo: this.mazoPozo
        }

    }

    // Se llama para iniciar la partida
    // se llama automaticamente cuando todos estan sentados
    comenzarPartida(socket: Socket) {

        // se genera aleatoriamente el jugador que empezara el juego
        this.turnoActual = this.jugadores[Math.round(Math.random() * (this.jugadores.length - 1))];

        this.repartir();
        
        // se emite la informacion al cliente para iniciar la partida
        this.emit('partida-iniciada', { partida: this.getPartida() }, socket);

    }

    //Se llama para repartir las manos de 6 cartas a los jugadores
    repartir() {

        this.generarMazo();

        this.barajarMazo(10);

        //saca la primera carta del mazo y la reparte
        this.jugadores.forEach(j => {
            for (let index = 0; index < 6; index++) {
                j.cartas.push(this.mazoPrincipal.shift()!);
            }
        })

    }

    //Funcion que devuelve un mazo nuevo;
    generarMazo() {

        let variaciones = 5;
        let repeticiones = 10;
        let valoresCartas = [25, 50, 75, 100, 200]
        let id = 1;

        for (let index = 0; index < variaciones; index++) {

            if (valoresCartas[index] === 100)
                repeticiones = 12
            else if (valoresCartas[index] === 200)
                repeticiones = 4;

            for (let index2 = 0; index2 < repeticiones; index2++) {

                this.mazoPrincipal.push(this.generarCarta(id, valoresCartas[index]));

                id++;
            }

        }
    }

    //Funcion que genera una carta nueva
    generarCarta(id: number, valor: number) {
        const carta: Carta = {
            id: id,
            tipo: 'Kilometraje',
            valor: valor
        }

        return carta;
    }

    //Funcion para barajar el mazo existente tantas veces lo indiques
    barajarMazo(repeticiones: number) {
        for (let index = 0; index < repeticiones; index++) {
            this.mazoPrincipal = this.mazoPrincipal.sort(function () { return Math.random() - 0.5 });
        }
    }

    //******************* FIN ACCIONES FUERA DE JUEGO *******************

    //******************* ACCIONES DENTRO DE JUEGO *******************

    // Se llama para jugar la carta de kilometros
    async jugarKilometro(carta: Carta, jugador: string, socket: Socket) {

        // Define si en esta jugada ya hay un ganador
        // si es asi, se cambia la propiedad gano como verdadera y se pasa el nombre del jugador que gano
        let ganador = {
            gano: false,
            jugador: ''
        }

        console.log('recibido');

        this.jugadores.forEach(j => {
            if (j.nickname === jugador) {
                // Aumenta los kilometros de la carta jugada al jugador
                j.kilometros = j.kilometros + carta.valor;
                
                // Se encuentra la carta jugada y se retira de la mano del jugador
                const desecho = j.cartas.splice(j.cartas.findIndex(c => c.id === carta.id), 1);
                
                // Luego se la agrega al pozo
                this.mazoPozo.push(desecho[0]);
                
                // Se chequea si la carta jugada gana la partida
                if (j.kilometros === 1000) {
                    ganador.gano = true;
                    ganador.jugador = j.nickname;
                }
            }
        })

        // Esperamos a que la promesa se ejecute para avanzar
        await this.siguienteTurno(jugador);

        this.emit('cartaJugada', { carta: carta, de: jugador, nuevoTurno: this.turnoActual?.nickname, partida: this.getPartida(), ganador: ganador }, socket);

    }

    // Se llama para tomar una carta
    tomarCarta(socket: Socket) {
        
        let carta: any;

        this.jugadores.forEach(j => {
            if (j.nickname === socket.jugador.nickname) {

                if (this.mazoPrincipal.length === 0) {
                    this.mazoPrincipal = this.mazoPozo;
                    this.mazoPozo = [];
                    this.barajarMazo(5);
                }

                carta = this.mazoPrincipal.shift()!;

                j.cartas.push(carta);

            }
        })

        this.emit('cartaTomada', { partida: this.getPartida(), jugador: socket.jugador.nickname, carta: carta, jugadores: this.jugadores }, socket)
    }

    // Se llama cuando el jugador pasa el turno
    pasar(socket: Socket) {

        const jugador = this.turnoActual?.nickname;

        this.siguienteTurno(jugador!);

        this.emit('pase', { jugador: jugador!, nuevoTurno: this.turnoActual?.nickname }, socket)

    }

    // Se llama para definir el proximo turno
    siguienteTurno(jugadorActual: string) {

        return new Promise((resolve,rejected)=>{

            let index = this.jugadores.findIndex(j => j.nickname === jugadorActual)
            
            if (index === (this.jugadores.length - 1)) {
                this.turnoActual = this.jugadores[0];
            } else {
                this.turnoActual = this.jugadores[index + 1];
            }

            resolve(true);
        })

    }

    //******************* FIN ACCIONES DENTRO DE JUEGO *******************

}