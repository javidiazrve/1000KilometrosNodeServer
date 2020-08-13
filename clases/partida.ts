import { Jugador } from './jugador';
import { Socket } from "socket.io";
import { Carta } from "../interfaces";

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
        if(funcion !== 'abandono'){
            socket.emit(funcion, data);
        }
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

        this.barajarMazo(30);

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

        //genera las cartas de kilometros
        for (let index = 0; index < variaciones; index++) {

            if (valoresCartas[index] === 100)
                repeticiones = 12
            else if (valoresCartas[index] === 200)
                repeticiones = 4;

            for (let index2 = 0; index2 < repeticiones; index2++) {

                this.mazoPrincipal.push(this.generarCarta(id, valoresCartas[index], 'Kilometraje', 'Aumentar'));

                id++;
            }
        }

        
        let tipoCartas = [
            ['Sin Gasolina', 'Pinchazo', 'Accidente', 'Limite Velocidad', 'Semaforo Rojo'],
            ['Gasolina','Rueda Recambio','Reparacion', 'Fin Limite Velocidad', 'Semaforo Verde'],
            ['Gasolina Infinita', 'Impinchable', 'As Volante', 'Vehiculo Prioritario']
        ];

        let tipos = ['Ataque', 'Defensa', 'Escudo']

        variaciones = 5;
        repeticiones = 3

        // genera las cartas especiales
        //recorre las 3 listas de tipo cartas
        for (let index = 0; index < 3; index++) {
            
            if(index === 2){
                variaciones = 4;
            }

            //recorre la lista seleccionada
            for (let index2 = 0; index2 < variaciones; index2++) {

                if(index === 0 && index2 === 3){
                    repeticiones = 4;
                }else if(index === 0 && index2 === 4){
                    repeticiones = 5;
                }else if(index === 1 && index2 === 0){
                    repeticiones = 6;
                }else if(index === 1 && index2 === 4){
                    repeticiones = 14;
                }else if(index === 2){
                    repeticiones = 1
                }

                //genera la cantidad de cartas respectivas para cada tipo
                for (let index3 = 0; index3 < repeticiones; index3++) {
                    this.mazoPrincipal.push(this.generarCarta(id, 0, tipos[index], tipoCartas[index][index2]));
                    id++;
                } 
            }
        }
    }

    //Funcion que genera una carta nueva
    generarCarta(id: number, valor: number, tipo: string, funcion: string) {
        const carta: Carta = {
            id,
            tipo,
            valor,
            funcion
        }

        return carta;
    }

    //Funcion para barajar el mazo existente tantas veces lo indiques
    barajarMazo(repeticiones: number) {
        for (let index = 0; index < repeticiones; index++) {
            this.mazoPrincipal = this.mazoPrincipal.sort(function () { return Math.random() - 0.5 });
        }
    }

    abandonarPartida(jugador: string, socket: Socket){

        let ganador = {
            gano: false,
            jugador: ''
        }

        const index = this.jugadores.findIndex(j => j.nickname === jugador);
        this.jugadores[index].cartas.forEach(c => this.mazoPozo.push(c));
        this.jugadores.splice(index,1);

        if(this.turnoActual?.nickname === jugador){
            this.siguienteTurno(jugador);
        }

        if(this.jugadores.length === 1){
            ganador.gano = true;
            ganador.jugador = this.jugadores[0].nickname;
        }

        this.emit('abandono', {jugador, ganador, partida: this.getPartida()}, socket)
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

        this.emit('cartaJugada', { jugada: { tipo: 'kilometros', carta, jugador}, nuevoTurno: this.turnoActual?.nickname, partida: this.getPartida(), ganador: ganador }, socket);

    }

    async jugarAtaque(carta: Carta, de: string, para: string, socket: Socket){

        this.jugadores.forEach(j => {
            if(j.nickname === para){
                switch (carta.funcion){
                    case 'Sin Gasolina':
                        j.estados.gasolina = false;
                        break;
                    case 'Pinchazo': 
                        j.estados.ruedas = false;
                        break;
                    case 'Accidente':
                        j.estados.coche = false;
                        break;
                    case 'Limite Velocidad':
                        j.estados.libre = false;
                        break;
                    case 'Semaforo Rojo':
                        j.estados.luz = false;
                        break;
                }
            }
            if(j.nickname === de){
                // Se encuentra la carta jugada y se retira de la mano del jugador
                const desecho = j.cartas.splice(j.cartas.findIndex(c => c.id === carta.id), 1);
                
                // Luego se la agrega al pozo
                this.mazoPozo.push(desecho[0]);
            }
        })

        await this.siguienteTurno(de);
        this.emit('cartaJugada', { jugada : {tipo: 'ataque', carta, de, para}, nuevoTurno: this.turnoActual?.nickname, partida: this.getPartida() }, socket);
    }

    async jugarDefensa(carta: Carta, de: string, socket: Socket){

        this.jugadores.forEach(j => {
            if(j.nickname === de){
                switch (carta.funcion){
                    case 'Gasolina':
                        j.estados.gasolina = true;
                        break;
                    case 'Rueda Recambio': 
                        j.estados.ruedas = true;
                        break;
                    case 'Reparacion':
                        j.estados.coche = true;
                        break;
                    case 'Fin Limite Velocidad':
                        j.estados.libre = true;
                        break;
                    case 'Semaforo Verde':
                        j.estados.luz = true;
                        break;
                }
            }
            if(j.nickname === de){
                // Se encuentra la carta jugada y se retira de la mano del jugador
                const desecho = j.cartas.splice(j.cartas.findIndex(c => c.id === carta.id), 1);
                
                // Luego se la agrega al pozo
                this.mazoPozo.push(desecho[0]);
            }
        })
        await this.siguienteTurno(de);
        this.emit('cartaJugada', { jugada : {tipo: 'defensa',carta, de}, nuevoTurno: this.turnoActual?.nickname, partida: this.getPartida() }, socket);
    }

    async jugarEscudo(carta: Carta, de: string, socket: Socket){

        this.jugadores.forEach(j => {
            if(j.nickname === de){
                switch (carta.funcion){
                    case 'Gasolina Infinita':
                        j.estados.gasolina = true;
                        j.estados.gasolinaInfinita = true;
                        break;
                    case 'Impinchable': 
                        j.estados.ruedas = true;
                        j.estados.impinchable = true;
                        break;
                    case 'As Volante':
                        j.estados.coche = true;
                        j.estados.asVolante = true;
                        break;
                    case 'Vehiculo Prioritario':
                        j.estados.libre = true;
                        j.estados.luz = true;
                        j.estados.prioritario = true;
                        break;
                }
            }
            if(j.nickname === de){
                // Se encuentra la carta jugada y se retira de la mano del jugador
                const desecho = j.cartas.splice(j.cartas.findIndex(c => c.id === carta.id), 1);
                
                // Luego se la agrega al pozo
                this.mazoPozo.push(desecho[0]);
            }
        })

        await this.siguienteTurno(de);
        
        this.emit('cartaJugada', { jugada : {tipo: 'escudo',carta, de}, nuevoTurno: this.turnoActual?.nickname, partida: this.getPartida() }, socket);
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