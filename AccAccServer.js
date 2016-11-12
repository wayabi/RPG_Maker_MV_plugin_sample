/*:
@plugindesc accacc server
@author wayabi.software
*/


function AccAcc() {
    this.hz = 0.0;
    this.power = 0.0;
    this.power_last = 0.0;
    this.x_power = 0.0;
    this.y_power = 0.0;
    this.z_power = 0.0;
    this.time_last = new Date().getTime();

    var address_server = "";
    var port_server = 0;

    var server = null;
    var clients = null;

    AccAcc.prototype.start_server = function (address, port) {
        if (server != null) return;
        if (address == null || address.length == 0) {
            address = getLocalAddress().ipv4[0].address;
        }
        
        address_server = address;
        port_server = port;
        var net = require('net');

        server = net.createServer();
        server.maxConnections = 1;

        function Client(socket) {
            this.socket = socket;
        }
        Client.prototype.writeData = function (d) {
            var socket = this.socket;
            //socket.remoteAddress
            //socket.remotePort
            if (socket.writable) {
                socket.write(d);
            }
        };
        Client.prototype.close = function () {
            this.socket.end();
        };

        clients = {}

        server.on('connection', function (socket) {
            var status = server.connections + '/' + server.maxConnections;
            var key = socket.remoteAddress + ':' + socket.remotePort;
            console.log('Connection Start(' + status + ') - ' + key);
            clients[key] = new Client(socket);
        });

        server.on('connection', function (socket) {
            var data = new Array();
            var power = 0.0;
            var hz = 0.0;
            var power_last = 0.0;

            socket.on('data', function (chunk) {
                for (var i = 0; i < chunk.length; i++) {
                    data.push(chunk[i]);
                }

                var size_float = 4;
                var buf = new Buffer(size_float);
                //hz(float)
                //power(float)
                //power_one_period(float)
                //x_power(float)
                //y_power(float)
                //z_power(float)
                //reserved(byte * 4)
                //total 28byte
                while (data.length >= 28) {
                    var data_parsed = new Array();
                    for (var i = 0; i < 7; i++) {
                        for (var j = 0; j < 4; j++) {
                            buf[j] = data.shift();
                        }
                        //Big Endian Float
                        var f = buf.readFloatBE(0);
                        data_parsed.push(f);
                    }

                    accacc.hz = data_parsed[0];
                    accacc.power = data_parsed[1];
                    accacc.power_last = data_parsed[2];
                    accacc.x_power = data_parsed[3];
                    accacc.y_power = data_parsed[4];
                    accacc.z_power = data_parsed[5];
                    //reserved data data_parsed[6] is not used this version.
                }
            });
        });

        server.on('connection', function (socket) {
            var key = socket.remoteAddress + ':' + socket.remotePort;
            socket.on('end', function () {
                var status = this.server.connections + '/' + this.server.maxConnections;
                console.log('Connection End(' + status + ') - ' + key);
                if (clients && clients[key]) {
                    delete clients[key];
                }
                // reset data
                accacc.hz = 0.0;
                accacc.power = 0.0;
                accacc.power_last = 0.0;
                accacc.x_power = 0.0;
                accacc.y_power = 0.0;
                accacc.z_power = 0.0;
            });
        });

        server.on('close', function () {
            console.log('Server Closed');
        });

        server.listen(port, address, function () {
            var addr = server.address();
            console.log('Listening Start on Server - ' + addr.address + ':' + addr.port);
        });
    }

    AccAcc.prototype.stop_server = function () {
        console.log("stop_server");
        server.close();
        for (key in clients) {
            clients[key].close();
        }
        server = null;
        clients = null;

        this.hz = 0.0;
        this.power = 0.0;
        this.power_last = 0.0;
        this.x_power = 0.0;
        this.y_power = 0.0;
        this.z_power = 0.0;
    }
    AccAcc.prototype.send_command = function (command) {
        for (key in clients) {
            console.log("send_command:"+command);
            clients[key].writeData(command);
        }
    }

    function getLocalAddress() {
        var os = require("os");
        var ifacesObj = {}
        ifacesObj.ipv4 = [];
        ifacesObj.ipv6 = [];
        var interfaces = os.networkInterfaces();

        for (var dev in interfaces) {
            interfaces[dev].forEach(function (details) {
                if (!details.internal) {
                    switch (details.family) {
                        case "IPv4":
                            ifacesObj.ipv4.push({ name: dev, address: details.address });
                            break;
                        case "IPv6":
                            ifacesObj.ipv6.push({ name: dev, address: details.address })
                            break;
                    }
                }
            });
        }
        return ifacesObj;
    };
};

// global variable accacc
// use other javascript

// ## server method ##
// accacc.start_server(address, port);
// accacc.send_command("vib,0,100\n");
// accacc.stop_server();

// ## accacc variable
// accacc.hz, accacc.power, accacc.last_power, accacc.x_power, accacc.y_power, accacc.z_power

accacc = new AccAcc();
