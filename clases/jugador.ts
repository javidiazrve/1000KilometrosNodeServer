import { Carta, EstadosJugador } from '../interfaces';

export class Jugador {

    nickname: string;
    cartas: Carta[];
    kilometros: number;
    listo: boolean;
    sentado: boolean;
    estados: EstadosJugador;

    constructor(apodo: string) {
        this.nickname = apodo;
        this.cartas = [];
        this.kilometros = 0;
        this.listo = false;
        this.sentado = false;
        this.estados = {
            luz: false,
            gasolina: true,
            ruedas: true,
            coche: true,
            libre: true,
            gasolinaInfinita: false,
            impinchable: false,
            asVolante: false,
            prioritario: false
        }
    }

}