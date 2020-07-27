"use strict";
exports.__esModule = true;
var Sala = /** @class */ (function () {
    function Sala(sala) {
        this.id = '';
        this.admin = '';
        this.jugadores = [];
        this.id = sala.id.toString();
        this.admin = sala.admin;
        this.jugadores = sala.jugadores;
    }
    Sala.prototype.getReady = function (jugador) {
        this.jugadores.forEach(function (j) {
            if (j.nickname.toString() === jugador.toString()) {
                if (j.listo) {
                    j.listo = false;
                }
                else {
                    j.listo = true;
                }
            }
        });
        console.log(this.jugadores);
    };
    return Sala;
}());
exports.Sala = Sala;
