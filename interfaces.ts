
export interface Sala {

    id: string,
    admin: string,
    jugadores: any[],
    mazo: Mazo,
    todosSentados: boolean,
    turnoActual: number

}

export interface Mazo {

    mazoPrincipal: Carta[],
    mazoDescarte: Carta[]

}

export interface Carta {
    id: number,
    tipo: string,
    valor: number,
    funcion: string,
    icon: string,
    clase: string
}

export interface EstadosJugador {

    luz: boolean,
    gasolina: boolean,
    ruedas: boolean,
    coche: boolean,
    libre: boolean,
    gasolinaInfinita: boolean;
    impinchable: boolean;
    asVolante: boolean;
    prioritario: boolean;

}