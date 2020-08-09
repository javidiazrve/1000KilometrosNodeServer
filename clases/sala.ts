import { Jugador } from "./jugador";
import { Server, Room, Socket } from "socket.io";
import { Partida } from "./partida";

export class Sala{

    id: string = '';
    admin: string = '';
    jugadores: Jugador[] = [];

    constructor(sala: any){

        this.id = sala.id.toString();
        this.admin = sala.admin;
        this.jugadores = sala.jugadores;
    }

    getInfoSala(){

        return {
            id: this.id,
            admin: this.admin,
            jugadores: this.jugadores
        }

    }
    
    nuevoJugador(jugador: Jugador, socket: Socket){

        this.jugadores.push(jugador);

        socket.emit('nueva-sala', this.getInfoSala());
        socket.to(this.id).emit('user-changed', { room: this.getInfoSala(), player: jugador.nickname, event: 'joined' });

    }

    irMesa(socket: Socket){

        socket.to(this.id).emit('ir-mesa');

    }

    listo(jugador: string, socket: Socket){

        this.jugadores.forEach((j:any) => {

            if (j.nickname === jugador) {
                if(j.listo){
                    j.listo = false;
                }else{
                    j.listo = true;
                }
            }

        })

        socket.emit('user-changed', { room: this.getInfoSala(), event: 'update' });
        socket.to(socket.room).emit('user-changed', { room: this.getInfoSala(), event: 'update' });

    }

    dejarSala(jugador: string, socket: Socket){

        if(this.jugadores.length > 1){
        
            this.jugadores.splice(this.jugadores.findIndex((el:any) => el.nickname === jugador),1);
            
            if(this.admin === jugador){
                this.admin = this.jugadores[0].nickname;
            }
        }

        socket.broadcast.to(this.id).emit('user-changed', { room: this.getInfoSala(), player: jugador, event: 'left' });
        
        socket.leave(this.id);

    }

    
}