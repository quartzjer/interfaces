module.exports = (function() {
  'use strict';

  var _     = require('underscore')
    , os    = require('os')
    // ..
    , interfaces  = os.networkInterfaces()
    , macregex       = /(([0-9a-f]{1,2}[\.:-]){5}([0-9a-f]{1,2}))/i
    , maskregex       = /mask[ :]{1}(\S+)\s/i
    , utils = require('./lib/utils');

  _.each(Object.keys(interfaces), function(interfaceName) {
    var ifconfig = utils.getInterfaceInfo(interfaceName)
      , mask  = '255.255.255.255'
      , macAddress  = '00:00:00:00:00:00'
      , maskmatches = maskregex.exec(ifconfig)
      , macmatches = macregex.exec(ifconfig);

    if (macmatches && macmatches.length > 0) {
      macAddress = macmatches[0];
    }

    if (maskmatches && maskmatches.length > 0) {
      mask = maskmatches[1];
      // decompose any lame 0xff* format into dotted quad
      if(mask.length == 10 && mask.substring(0,2) == '0x')
      {
        var ip = new Buffer(mask.substring(2),'hex');
        mask = "";
        for(var i = 0; i < 3; i++) mask += ip[i]+'.';
        mask += ip[3];
      }
    }

    for(var address in interfaces[interfaceName]) {
      interfaces[interfaceName][address]['mask'] = mask;
      interfaces[interfaceName][address]['mac'] = macAddress;
    }
  });
  return interfaces;
});
