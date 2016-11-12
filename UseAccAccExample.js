/*:
@plugindesc example using AccAccServer.js.
@author wayabi.software
*/

// accacc is global variable

// accacc data process async loop
function accacc_loop(accacc, time_last) {
    // get current time(millisec)
    var t = new Date().getTime();
    
    // hz > 0.4 : if shaking speed is faster than 0.4 times_per_sec
    // power > 1.0 : if shaking power larger than 1.0m/s^2
    // last_power > 1.0 : if last one_shake_period power larger than 1.0
    if (accacc.hz > 0.4 && accacc.power > 1.0 && accacc.power_last > 1.0) {
        one_shake_period_millisec = (1.0 / accacc.hz) * 1000;
        // check if it expired one_shake_period_millisec from last check.
        if (t - time_last > one_shake_period_millisec) {
            // update time_last checked
            var n = Math.floor((t - time_last) / one_shake_period_millisec);
            time_last = t - ((t - time_last) - n * one_shake_period_millisec);

            // play audio in "./audio/se/Decision2.ogg"
            obj = { name: "Decision2", pan: 0, pitch: 100, volume: 100 };
            AudioManager.playSe(obj);
        }
    }
  
    // async loop. loop 20msec later.
    setTimeout(function () { accacc_loop(accacc, time_last); }, 20);
}

(function () {
    // called once map started
    var Scene_map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        Scene_map_start.call(this);

        // if address = null, set address automatically(set first network card)
        var address = null
        var port = 12345;
        // start accacc server
        accacc.start_server(address, port);

        //start accacc data process loop
        var time_last = new Date().getTime();
        accacc_loop(accacc, time_last);
    };

    // GamePlayer step count
    var moveCount = 0;
    var _Game_Player_prototype_executeMove = Game_Player.prototype.executeMove;
    Game_Player.prototype.executeMove = function (direction) {
        _Game_Player_prototype_executeMove.call(this, direction);
        moveCount++;
        console.log("moveCount: " + moveCount);

        // vibration per 5steps
        if ((moveCount % 5) == 0) {

            accacc.send_command("vib,0,100\n");
        }
    };
})();
