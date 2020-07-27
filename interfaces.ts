import { Sala } from "./clases/sala";
import { Rooms } from "socket.io";

export interface Room{

    sala?: Sala,
    rooms?: Rooms

}