/**
 * Created by linfei6 on 2018/2/9.
 */
(function(scope){

  var dec2hex = [];
  for (var i=0; i<=15; i++) {
    dec2hex[i] = i.toString(16);
  }

  var UUID = function() {
    var uuid = '';
    for (var i=1; i<=36; i++) {
      if (i===9 || i===14 || i===19 || i===24) {
        uuid += '-';
      } else if (i===15) {
        uuid += 4;
      } else if (i===20) {
        uuid += dec2hex[(Math.random()*4|0 + 8)];
      } else {
        uuid += dec2hex[(Math.random()*15|0)];
      }
    }
    return uuid;
  };

  if (typeof exports !== 'undefined') {
    module.exports = UUID;
  } else {
    scope.UUID = UUID;
  }

})(this);
