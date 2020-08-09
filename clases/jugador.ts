import { Carta } from "../interfaces";
import { Socket } from "socket.io";

export class Jugador{

    nickname: string;
    cartas: Carta[];
    kilometros: number;
    listo: boolean;
    sentado: boolean;

    constructor(apodo: string){
        this.nickname = apodo;
        this.cartas = [];
        this.kilometros = 0;
        this.listo = false;
        this.sentado = false;
    }

}