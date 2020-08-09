"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var io = __importStar(require("socket.io"));
var i = io;
var Socket = function (server) {
    var io = i.listen(server);
    io.on('connection', function (socket) {
        console.log('new Connection');
        var lobby = require('./controladores/lobby')(socket, io);
    });
};
module.exports = Socket;
