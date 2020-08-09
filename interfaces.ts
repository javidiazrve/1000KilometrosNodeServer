
export interface Sala{

    id: string,
    admin: string,
    jugadores: any[],
    mazo: Mazo,
    todosSentados: boolean,
    turnoActual: number


}

export interface Mazo{

    mazoPrincipal: Carta[],
    mazoDescarte: Carta[]

}

export interface Carta{
    id: number,
    tipo: string,
    valor: number

}