/**
 * module dependencies
 */
var CryptoJS = require('crypto-js');

/**
 * do exports
 */
exports = module.exports = aesRsaEncrypt;

exports.encryptData = function(data) {

  // para1
  data = JSON.stringify(data);

  // para2
  var bhv = "010001";

  // para3
  var bhd_md = [
    "00e0b509f6259df8642", "dbc35662901477df22677",
    "ec152b5ff68ace615bb7b725", "152b3ab17a876aea8a5aa7",
    "6d2e417629ec4ee341f56135", "fccf695280104e0312ecbd",
    "a92557c93870114af6c9d05", "c4f7f0c3685b7a46bee2",
    "55932575cce10b424d813", "cfe4875d3e82047b97ddef5",
    "2741d546b8e289dc693", "5b3ece0462db0a22b8e7"
  ].join('');

  // para4
  var bhu = "0CoJUm6Qyw8W8jud";

  return aesRsaEncrypt(data, bhv, bhd_md, bhu);
};


function RSAKeyPair(encryptionExponent, decryptionExponent, modulus) {
  this.e = biFromHex(encryptionExponent);
  this.d = biFromHex(decryptionExponent);
  this.m = biFromHex(modulus);
  this.chunkSize = 2 * biHighIndex(this.m);
  this.radix = 16;
  this.barrett = new BarrettMu(this.m)
}

function twoDigit(n) {
  return (n < 10 ? "0" : "") + String(n)
}

function encryptedString(key, s) {
  var a = new Array;
  var sl = s.length;
  var i = 0;
  while (i < sl) {
    a[i] = s.charCodeAt(i);
    i++
  }
  while (a.length % key.chunkSize != 0) {
    a[i++] = 0
  }
  var al = a.length;
  var result = "";
  var j, k, block;
  for (i = 0; i < al; i += key.chunkSize) {
    block = new BigInt;
    j = 0;
    for (k = i; k < i + key.chunkSize; ++j) {
      block.digits[j] = a[k++];
      block.digits[j] += a[k++] << 8
    }
    var crypt = key.barrett.powMod(block, key.e);
    var text = key.radix == 16 ? biToHex(crypt) : biToString(crypt, key.radix);
    result += text + " "
  }
  return result.substring(0, result.length - 1)
}

function decryptedString(key, s) {
  var blocks = s.split(" ");
  var result = "";
  var i, j, block;
  for (i = 0; i < blocks.length; ++i) {
    var bi;
    if (key.radix == 16) {
      bi = biFromHex(blocks[i])
    } else {
      bi = biFromString(blocks[i], key.radix)
    }
    block = key.barrett.powMod(bi, key.d);
    for (j = 0; j <= biHighIndex(block); ++j) {
      result += String.fromCharCode(block.digits[j] & 255, block.digits[j] >> 8)
    }
  }
  if (result.charCodeAt(result.length - 1) == 0) {
    result = result.substring(0, result.length - 1)
  }
  return result
}
var biRadixBase = 2;
var biRadixBits = 16;
var bitsPerDigit = biRadixBits;
var biRadix = 1 << 16;
var biHalfRadix = biRadix >>> 1;
var biRadixSquared = biRadix * biRadix;
var maxDigitVal = biRadix - 1;
var maxInteger = 9999999999999998;
var maxDigits;
var ZERO_ARRAY;
var bigZero, bigOne;

function setMaxDigits(value) {
  maxDigits = value;
  ZERO_ARRAY = new Array(maxDigits);
  for (var iza = 0; iza < ZERO_ARRAY.length; iza++)
    ZERO_ARRAY[iza] = 0;
  bigZero = new BigInt;
  bigOne = new BigInt;
  bigOne.digits[0] = 1
}
setMaxDigits(20);
var dpl10 = 15;
var lr10 = biFromNumber(1e15);

function BigInt(flag) {
  if (typeof flag == "boolean" && flag == true) {
    this.digits = null
  } else {
    this.digits = ZERO_ARRAY.slice(0)
  }
  this.isNeg = false
}

function biFromDecimal(s) {
  var isNeg = s.charAt(0) == "-";
  var i = isNeg ? 1 : 0;
  var result;
  while (i < s.length && s.charAt(i) == "0")
  ++i;
  if (i == s.length) {
    result = new BigInt
  } else {
    var digitCount = s.length - i;
    var fgl = digitCount % dpl10;
    if (fgl == 0)
      fgl = dpl10;
    result = biFromNumber(Number(s.substr(i, fgl)));
    i += fgl;
    while (i < s.length) {
      result = biAdd(biMultiply(result, lr10), biFromNumber(Number(s.substr(i, dpl10))));
      i += dpl10
    }
    result.isNeg = isNeg
  }
  return result
}

function biCopy(bi) {
  var result = new BigInt(true);
  result.digits = bi.digits.slice(0);
  result.isNeg = bi.isNeg;
  return result
}

function biFromNumber(i) {
  var result = new BigInt;
  result.isNeg = i < 0;
  i = Math.abs(i);
  var j = 0;
  while (i > 0) {
    result.digits[j++] = i & maxDigitVal;
    i >>= biRadixBits
  }
  return result
}

function reverseStr(s) {
  var result = "";
  for (var i = s.length - 1; i > -1; --i) {
    result += s.charAt(i)
  }
  return result
}
var hexatrigesimalToChar = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z");

function biToString(x, radix) {
  var b = new BigInt;
  b.digits[0] = radix;
  var qr = biDivideModulo(x, b);
  var result = hexatrigesimalToChar[qr[1].digits[0]];
  while (biCompare(qr[0], bigZero) == 1) {
    qr = biDivideModulo(qr[0], b);
    digit = qr[1].digits[0];
    result += hexatrigesimalToChar[qr[1].digits[0]]
  }
  return (x.isNeg ? "-" : "") + reverseStr(result)
}

function biToDecimal(x) {
  var b = new BigInt;
  b.digits[0] = 10;
  var qr = biDivideModulo(x, b);
  var result = String(qr[1].digits[0]);
  while (biCompare(qr[0], bigZero) == 1) {
    qr = biDivideModulo(qr[0], b);
    result += String(qr[1].digits[0])
  }
  return (x.isNeg ? "-" : "") + reverseStr(result)
}
var hexToChar = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");

function digitToHex(n) {
  var mask = 15;
  var result = "";
  for (i = 0; i < 4; ++i) {
    result += hexToChar[n & mask];
    n >>>= 4
  }
  return reverseStr(result)
}

function biToHex(x) {
  var result = "";
  var n = biHighIndex(x);
  for (var i = biHighIndex(x); i > -1; --i) {
    result += digitToHex(x.digits[i])
  }
  return result
}

function charToHex(c) {
  var ZERO = 48;
  var NINE = ZERO + 9;
  var littleA = 97;
  var littleZ = littleA + 25;
  var bigA = 65;
  var bigZ = 65 + 25;
  var result;
  if (c >= ZERO && c <= NINE) {
    result = c - ZERO
  } else if (c >= bigA && c <= bigZ) {
    result = 10 + c - bigA
  } else if (c >= littleA && c <= littleZ) {
    result = 10 + c - littleA
  } else {
    result = 0
  }
  return result
}

function hexToDigit(s) {
  var result = 0;
  var sl = Math.min(s.length, 4);
  for (var i = 0; i < sl; ++i) {
    result <<= 4;
    result |= charToHex(s.charCodeAt(i))
  }
  return result
}

function biFromHex(s) {
  var result = new BigInt;
  var sl = s.length;
  for (var i = sl, j = 0; i > 0; i -= 4, ++j) {
    result.digits[j] = hexToDigit(s.substr(Math.max(i - 4, 0), Math.min(i, 4)))
  }
  return result
}

function biFromString(s, radix) {
  var isNeg = s.charAt(0) == "-";
  var istop = isNeg ? 1 : 0;
  var result = new BigInt;
  var place = new BigInt;
  place.digits[0] = 1;
  for (var i = s.length - 1; i >= istop; i--) {
    var c = s.charCodeAt(i);
    var digit = charToHex(c);
    var biDigit = biMultiplyDigit(place, digit);
    result = biAdd(result, biDigit);
    place = biMultiplyDigit(place, radix)
  }
  result.isNeg = isNeg;
  return result
}

function biDump(b) {
  return (b.isNeg ? "-" : "") + b.digits.join(" ")
}

function biAdd(x, y) {
  var result;
  if (x.isNeg != y.isNeg) {
    y.isNeg = !y.isNeg;
    result = biSubtract(x, y);
    y.isNeg = !y.isNeg
  } else {
    result = new BigInt;
    var c = 0;
    var n;
    for (var i = 0; i < x.digits.length; ++i) {
      n = x.digits[i] + y.digits[i] + c;
      result.digits[i] = n & 65535;
      c = Number(n >= biRadix)
    }
    result.isNeg = x.isNeg
  }
  return result
}

function biSubtract(x, y) {
  var result;
  if (x.isNeg != y.isNeg) {
    y.isNeg = !y.isNeg;
    result = biAdd(x, y);
    y.isNeg = !y.isNeg
  } else {
    result = new BigInt;
    var n, c;
    c = 0;
    for (var i = 0; i < x.digits.length; ++i) {
      n = x.digits[i] - y.digits[i] + c;
      result.digits[i] = n & 65535;
      if (result.digits[i] < 0)
        result.digits[i] += biRadix;
      c = 0 - Number(n < 0)
    }
    if (c == -1) {
      c = 0;
      for (var i = 0; i < x.digits.length; ++i) {
        n = 0 - result.digits[i] + c;
        result.digits[i] = n & 65535;
        if (result.digits[i] < 0)
          result.digits[i] += biRadix;
        c = 0 - Number(n < 0)
      }
      result.isNeg = !x.isNeg
    } else {
      result.isNeg = x.isNeg
    }
  }
  return result
}

function biHighIndex(x) {
  var result = x.digits.length - 1;
  while (result > 0 && x.digits[result] == 0)
  --result;
  return result
}

function biNumBits(x) {
  var n = biHighIndex(x);
  var d = x.digits[n];
  var m = (n + 1) * bitsPerDigit;
  var result;
  for (result = m; result > m - bitsPerDigit; --result) {
    if ((d & 32768) != 0)
      break;
    d <<= 1
  }
  return result
}

function biMultiply(x, y) {
  var result = new BigInt;
  var c;
  var n = biHighIndex(x);
  var t = biHighIndex(y);
  var u, uv, k;
  for (var i = 0; i <= t; ++i) {
    c = 0;
    k = i;
    for (j = 0; j <= n; ++j, ++k) {
      uv = result.digits[k] + x.digits[j] * y.digits[i] + c;
      result.digits[k] = uv & maxDigitVal;
      c = uv >>> biRadixBits
    }
    result.digits[i + n + 1] = c
  }
  result.isNeg = x.isNeg != y.isNeg;
  return result
}

function biMultiplyDigit(x, y) {
  var n, c, uv;
  result = new BigInt;
  n = biHighIndex(x);
  c = 0;
  for (var j = 0; j <= n; ++j) {
    uv = result.digits[j] + x.digits[j] * y + c;
    result.digits[j] = uv & maxDigitVal;
    c = uv >>> biRadixBits
  }
  result.digits[1 + n] = c;
  return result
}

function arrayCopy(src, srcStart, dest, destStart, n) {
  var m = Math.min(srcStart + n, src.length);
  for (var i = srcStart, j = destStart; i < m; ++i, ++j) {
    dest[j] = src[i]
  }
}
var highBitMasks = new Array(0, 32768, 49152, 57344, 61440, 63488, 64512, 65024, 65280, 65408, 65472, 65504, 65520, 65528, 65532, 65534, 65535);

function biShiftLeft(x, n) {
  var digitCount = Math.floor(n / bitsPerDigit);
  var result = new BigInt;
  arrayCopy(x.digits, 0, result.digits, digitCount, result.digits.length - digitCount);
  var bits = n % bitsPerDigit;
  var rightBits = bitsPerDigit - bits;
  for (var i = result.digits.length - 1, i1 = i - 1; i > 0; --i, --i1) {
    result.digits[i] = result.digits[i] << bits & maxDigitVal | (result.digits[i1] & highBitMasks[bits]) >>> rightBits
  }
  result.digits[0] = result.digits[i] << bits & maxDigitVal;
  result.isNeg = x.isNeg;
  return result
}
var lowBitMasks = new Array(0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767, 65535);

function biShiftRight(x, n) {
  var digitCount = Math.floor(n / bitsPerDigit);
  var result = new BigInt;
  arrayCopy(x.digits, digitCount, result.digits, 0, x.digits.length - digitCount);
  var bits = n % bitsPerDigit;
  var leftBits = bitsPerDigit - bits;
  for (var i = 0, i1 = i + 1; i < result.digits.length - 1; ++i, ++i1) {
    result.digits[i] = result.digits[i] >>> bits | (result.digits[i1] & lowBitMasks[bits]) << leftBits
  }
  result.digits[result.digits.length - 1] >>>= bits;
  result.isNeg = x.isNeg;
  return result
}

function biMultiplyByRadixPower(x, n) {
  var result = new BigInt;
  arrayCopy(x.digits, 0, result.digits, n, result.digits.length - n);
  return result
}

function biDivideByRadixPower(x, n) {
  var result = new BigInt;
  arrayCopy(x.digits, n, result.digits, 0, result.digits.length - n);
  return result
}

function biModuloByRadixPower(x, n) {
  var result = new BigInt;
  arrayCopy(x.digits, 0, result.digits, 0, n);
  return result
}

function biCompare(x, y) {
  if (x.isNeg != y.isNeg) {
    return 1 - 2 * Number(x.isNeg)
  }
  for (var i = x.digits.length - 1; i >= 0; --i) {
    if (x.digits[i] != y.digits[i]) {
      if (x.isNeg) {
        return 1 - 2 * Number(x.digits[i] > y.digits[i])
      } else {
        return 1 - 2 * Number(x.digits[i] < y.digits[i])
      }
    }
  }
  return 0
}

function biDivideModulo(x, y) {
  var nb = biNumBits(x);
  var tb = biNumBits(y);
  var origYIsNeg = y.isNeg;
  var q, r;
  if (nb < tb) {
    if (x.isNeg) {
      q = biCopy(bigOne);
      q.isNeg = !y.isNeg;
      x.isNeg = false;
      y.isNeg = false;
      r = biSubtract(y, x);
      x.isNeg = true;
      y.isNeg = origYIsNeg
    } else {
      q = new BigInt;
      r = biCopy(x)
    }
    return new Array(q, r)
  }
  q = new BigInt;
  r = x;
  var t = Math.ceil(tb / bitsPerDigit) - 1;
  var lambda = 0;
  while (y.digits[t] < biHalfRadix) {
    y = biShiftLeft(y, 1);
    ++lambda;
    ++tb;
    t = Math.ceil(tb / bitsPerDigit) - 1
  }
  r = biShiftLeft(r, lambda);
  nb += lambda;
  var n = Math.ceil(nb / bitsPerDigit) - 1;
  var b = biMultiplyByRadixPower(y, n - t);
  while (biCompare(r, b) != -1) {
    ++q.digits[n - t];
    r = biSubtract(r, b)
  }
  for (var i = n; i > t; --i) {
    var ri = i >= r.digits.length ? 0 : r.digits[i];
    var ri1 = i - 1 >= r.digits.length ? 0 : r.digits[i - 1];
    var ri2 = i - 2 >= r.digits.length ? 0 : r.digits[i - 2];
    var yt = t >= y.digits.length ? 0 : y.digits[t];
    var yt1 = t - 1 >= y.digits.length ? 0 : y.digits[t - 1];
    if (ri == yt) {
      q.digits[i - t - 1] = maxDigitVal
    } else {
      q.digits[i - t - 1] = Math.floor((ri * biRadix + ri1) / yt)
    }
    var c1 = q.digits[i - t - 1] * (yt * biRadix + yt1);
    var c2 = ri * biRadixSquared + (ri1 * biRadix + ri2);
    while (c1 > c2) {
      --q.digits[i - t - 1];
      c1 = q.digits[i - t - 1] * (yt * biRadix | yt1);
      c2 = ri * biRadix * biRadix + (ri1 * biRadix + ri2)
    }
    b = biMultiplyByRadixPower(y, i - t - 1);
    r = biSubtract(r, biMultiplyDigit(b, q.digits[i - t - 1]));
    if (r.isNeg) {
      r = biAdd(r, b);
      --q.digits[i - t - 1]
    }
  }
  r = biShiftRight(r, lambda);
  q.isNeg = x.isNeg != origYIsNeg;
  if (x.isNeg) {
    if (origYIsNeg) {
      q = biAdd(q, bigOne)
    } else {
      q = biSubtract(q, bigOne)
    }
    y = biShiftRight(y, lambda);
    r = biSubtract(y, r)
  }
  if (r.digits[0] == 0 && biHighIndex(r) == 0)
    r.isNeg = false;
  return new Array(q, r)
}

function biDivide(x, y) {
  return biDivideModulo(x, y)[0]
}

function biModulo(x, y) {
  return biDivideModulo(x, y)[1]
}

function biMultiplyMod(x, y, m) {
  return biModulo(biMultiply(x, y), m)
}

function biPow(x, y) {
  var result = bigOne;
  var a = x;
  while (true) {
    if ((y & 1) != 0)
      result = biMultiply(result, a);
    y >>= 1;
    if (y == 0)
      break;
    a = biMultiply(a, a)
  }
  return result
}

function biPowMod(x, y, m) {
  var result = bigOne;
  var a = x;
  var k = y;
  while (true) {
    if ((k.digits[0] & 1) != 0)
      result = biMultiplyMod(result, a, m);
    k = biShiftRight(k, 1);
    if (k.digits[0] == 0 && biHighIndex(k) == 0)
      break;
    a = biMultiplyMod(a, a, m)
  }
  return result
}

function BarrettMu(m) {
  this.modulus = biCopy(m);
  this.k = biHighIndex(this.modulus) + 1;
  var b2k = new BigInt;
  b2k.digits[2 * this.k] = 1;
  this.mu = biDivide(b2k, this.modulus);
  this.bkplus1 = new BigInt;
  this.bkplus1.digits[this.k + 1] = 1;
  this.modulo = BarrettMu_modulo;
  this.multiplyMod = BarrettMu_multiplyMod;
  this.powMod = BarrettMu_powMod
}

function BarrettMu_modulo(x) {
  var q1 = biDivideByRadixPower(x, this.k - 1);
  var q2 = biMultiply(q1, this.mu);
  var q3 = biDivideByRadixPower(q2, this.k + 1);
  var r1 = biModuloByRadixPower(x, this.k + 1);
  var r2term = biMultiply(q3, this.modulus);
  var r2 = biModuloByRadixPower(r2term, this.k + 1);
  var r = biSubtract(r1, r2);
  if (r.isNeg) {
    r = biAdd(r, this.bkplus1)
  }
  var rgtem = biCompare(r, this.modulus) >= 0;
  while (rgtem) {
    r = biSubtract(r, this.modulus);
    rgtem = biCompare(r, this.modulus) >= 0
  }
  return r
}

function BarrettMu_multiplyMod(x, y) {
  var xy = biMultiply(x, y);
  return this.modulo(xy)
}

function BarrettMu_powMod(x, y) {
  var result = new BigInt;
  result.digits[0] = 1;
  var a = x;
  var k = y;
  while (true) {
    if ((k.digits[0] & 1) != 0)
      result = this.multiplyMod(result, a);
    k = biShiftRight(k, 1);
    if (k.digits[0] == 0 && biHighIndex(k) == 0)
      break;
    a = this.multiplyMod(a, a)
  }
  return result
}

function createSecretKey(size) {
  var keys = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var key = "";
  for (var i = 0; i < size; i = i + 1) {
    var pos = Math.random() * keys.length;
    pos = Math.floor(pos);
    key = key + keys.charAt(pos)
  }
  return key
}

function aesEncrypt(text, secKey) {
  var key = CryptoJS.enc.Utf8.parse(secKey);
  var iv = CryptoJS.enc.Utf8.parse("0102030405060708");
  var srcs = CryptoJS.enc.Utf8.parse(text);
  var encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC
  });
  return encrypted.toString()
}

function rsaEncrypt(text, pubKey, modulus) {
  setMaxDigits(131); // ?
  var keys = new RSAKeyPair(pubKey, "", modulus); // ?
  var encText = encryptedString(keys, text); // ?
  return encText
}

function aesRsaEncrypt(text, pubKey, modulus, nonce) {
  var result = {};
  var secKey = createSecretKey(16);
  result.encText = aesEncrypt(text, nonce);
  result.encText = aesEncrypt(result.encText, secKey);
  result.encSecKey = rsaEncrypt(secKey, pubKey, modulus);
  return result
}

function rsaNonceEncrypt(text, pubKey, modulus, nonce) {
  var result = {};
  result.encText = rsaEncrypt(text + nonce, pubKey, modulus);
  return result
}