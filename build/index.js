"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http = __importStar(require("http"));
var app = express_1.default();
var PORT = process.env.PORT || 4008;
var server = http.createServer(app);
var socket = require('./socket')(server);
server.listen(PORT, function () {
    console.log("server escuchando en puerto: " + PORT);
});
