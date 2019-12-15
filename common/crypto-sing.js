const crypto = require('crypto');

// ase-128-cbc 加密算法要求key和iv长度都为16
var key = Buffer.from('8vApxLk2G1PAsJrM', 'utf8');
var iv = Buffer.from('FnJL6EDzjqWjcaY3', 'utf8');

// 加密
const aseEncode = function(src) {
  let sign = '';
  let cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  sign += cipher.update(src, 'utf8', 'hex');
  sign += cipher.final('hex');
  return sign;
}

// 解密
const aseDecode = function(sign) {
  let src = '';
  let cipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  src += cipher.update(sign, 'hex', 'utf8');
  src += cipher.final('utf8');
  return src;
}

module.exports = { aseEncode, aseDecode };
