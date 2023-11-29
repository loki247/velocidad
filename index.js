const app = require('express')();
const http = require('http').createServer(app); // const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: '*' } });
const path = require("path");
const host = 'localhost';
const port = 3000;
const { static } = require("express");
const net = require('net');

//Crea servidor net que recibe datos
const server = net.createServer((socket) => { //'connection' listener
    console.log('Cliente conectado.');

    //Recibe los datos
    socket.on('data', (data) => {
        //Tranforma el Buffer al valor que fue recibido
        console.log(data);

        let valor = 0;
        valor = (data.toString());

        console.log(valor);

        //Envia los datos recibidos al lado del cliente
        io.emit("data", { velocidad: valor, tiempo: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes() + ":" + new Date(Date.now()).getSeconds() });
    });

    socket.on('end', () => {
        console.log('Cliente desconetado.');
    });

    socket.on('error', () => {
        console.log('Cliente se desconecto repentinamente.');
    });

    socket.write('hello\r\n');
    socket.pipe(socket);
});

app.use(static(path.join(__dirname, 'public'))); // app.use(static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'))
});

app.use((req, res) => {
    res.status(404).send("NOT FOUND");
});

//Levanta servidor net y queda operativo para recibir datos
server.listen(8124, () => { //'listening' listener
    console.log('server bound');
});

//Levanta servidor socket.io para enviar los datos al lado del cliente
http.listen(port, () => console.log(`Socket.IO server running at http://${host}:${port}/`));