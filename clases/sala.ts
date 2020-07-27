import { Jugador } from "./jugador";

export class Sala{

    id: string = '';
    admin: string = '';
    jugadores: Jugador[] = [];


    constructor(sala: any){

        this.id = sala.id.toString();
        this.admin = sala.admin;
        this.jugadores = sala.jugadores;

    }

    getReady(jugador: string){

        this.jugadores.forEach(j => {            

            if(j.nickname.toString() === jugador.toString()){
            
                if(j.listo){
                    j.listo = false;
                }else{
                    j.listo = true;
                }
            
            }

        })

        console.log(this.jugadores);

    }

}