import express from "express";
import * as http from 'http';

const app = express();

const PORT = process.env.PORT || 4008;

const server = http.createServer(app);

let socket = require('./socket')(server)

server.listen(PORT, ()=> {

    console.log(`server escuchando en puerto: ${PORT}`);

})