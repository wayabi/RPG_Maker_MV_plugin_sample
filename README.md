# RPG Maker MV plugin sample for accacc

"accacc" is a smart phone app to get phone shaking move.
(http://wayabi.genin.jp/)

This sample plugin have features below.

1. accacc server start on Game Scene_Map start(server port default is 12345)
2. show ip_address and port message
3. if "accacc" on your phone connect to the server, play SE per shake
4. phone vibrate per Game Player walk 5 steps

# Usage

put *.js to <RPG_Maker_dir>/<project_dir>/js/plugins/

import 2 plugins in this order.

1. AccAccServer.js
2. UseAccAccExample.js

# To make Another accacc Plugin

AccAccServer.js declear global variable "accacc".

You can call accacc method and variable from your plugin js.

    // method
    accacc.start_server(address, port);
    accacc.send_command("vib,0,100);
    accacc.stop_server();

    // variable
    accacc.hz
    accacc.power
    accacc.power_last
    accacc.x_power
    accacc.y_power
    accacc.z_power
