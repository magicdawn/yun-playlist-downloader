'use strict'
/* eslint no-var: off, curly: off, eqeqeq: off */

const k5p = exports
const p = exports

exports.main = k5p.cAF7y = function(bny9p, J6D) {
  return k5p.cpe4i(k5p.cik2x(bny9p), J6D)
}

var bKG5L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  PR1x = {},
  FP7I = {}
for (var i = 0, l = bKG5L.length, c; i < l; i++) {
  c = bKG5L.charAt(i)
  PR1x[i] = c
  FP7I[c] = i
}

var bKB5G = (function() {
  var ss2x = /\n|\r|=/g
  return function(j5o) {
    var r5w = 0,
      o5t = []
    j5o = j5o.replace(ss2x, '')
    for (var i = 0, l = j5o.length; i < l; i += 4)
      o5t.push(
        (FP7I[j5o.charAt(i)] << 2) | (FP7I[j5o.charAt(i + 1)] >> 4),
        ((FP7I[j5o.charAt(i + 1)] & 15) << 4) | (FP7I[j5o.charAt(i + 2)] >> 2),
        ((FP7I[j5o.charAt(i + 2)] & 3) << 6) | FP7I[j5o.charAt(i + 3)]
      )
    var bq6k = o5t.length,
      fj8b = j5o.length % 4
    if (fj8b == 2) o5t = o5t.slice(0, bq6k - 2)
    if (fj8b == 3) o5t = o5t.slice(0, bq6k - 1)
    return o5t
  }
})()

p.cik2x = function(j5o) {
  var iz9q = bKB5G(j5o),
    dq7j = iz9q.length,
    iu9l
  var r5w = 0
  while ((iu9l = iz9q[r5w])) {
    if (iu9l > 128) {
      iz9q[r5w] = iu9l - 256
    }
    r5w++
  }
  return iz9q
}

k5p.cpe4i = function(bny9p, J6D) {
  var bnB9s = bza2x(bny9p, bzr2x(J6D))
  var Fz7s = new String(bzx2x(bnB9s))
  var zk5p = []
  var bnz9q = Fz7s.length / 2
  var bh6b = 0
  for (var i = 0; i < bnz9q; i++) {
    zk5p.push('%')
    zk5p.push(Fz7s.charAt(bh6b++))
    zk5p.push(Fz7s.charAt(bh6b++))
  }
  return zk5p.join('')
}

var AR5W = function(hW9N) {
  if (hW9N < -128) {
    return AR5W(128 - (-128 - hW9N))
  } else if (hW9N >= -128 && hW9N <= 127) {
    return hW9N
  } else if (hW9N > 127) {
    return AR5W(-129 + hW9N - 127)
  } else {
    throw new Error('1001')
  }
}
var cup5u = function(hW9N, bh6b) {
  return AR5W(hW9N + bh6b)
}
var cun5s = function(Yk4o, boe9V) {
  if (Yk4o == null) {
    return null
  }
  if (boe9V == null) {
    return Yk4o
  }
  var qM2x = []
  var cul5q = boe9V.length
  for (var i = 0, bq6k = Yk4o.length; i < bq6k; i++) {
    qM2x[i] = cup5u(Yk4o[i], boe9V[i % cul5q])
  }
  return qM2x
}
var cue5j = function(Yr4v) {
  if (Yr4v == null) {
    return Yr4v
  }
  var qM2x = []
  var ctY5d = Yr4v.length
  for (var i = 0, bq6k = ctY5d; i < bq6k; i++) {
    qM2x[i] = AR5W(0 - Yr4v[i])
  }
  return qM2x
}
var ctN5S = function(bnZ9Q, Sn2x) {
  bnZ9Q = AR5W(bnZ9Q)
  Sn2x = AR5W(Sn2x)
  return AR5W(bnZ9Q ^ Sn2x)
}
var bzG2x = function(Ss2x, bnX9O) {
  if (Ss2x == null || bnX9O == null || Ss2x.length != bnX9O.length) {
    return Ss2x
  }
  var qM2x = []
  var ctr5w = Ss2x.length
  for (var i = 0, bq6k = ctr5w; i < bq6k; i++) {
    qM2x[i] = ctN5S(Ss2x[i], bnX9O[i])
  }
  return qM2x
}
var bzC2x = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
]
var csZ5e = function(du7n) {
  var JQ8I = []
  JQ8I.push(bzC2x[(du7n >>> 4) & 15])
  JQ8I.push(bzC2x[du7n & 15])
  return JQ8I.join('')
}
var bzx2x = function(vm3x) {
  var bq6k = vm3x.length
  if (vm3x == null || bq6k < 0) {
    return new String('')
  }
  var JQ8I = []
  for (var i = 0; i < bq6k; i++) {
    JQ8I.push(csZ5e(vm3x[i]))
  }
  return JQ8I.join('')
}
var bzw2x = function(YP4T) {
  if (YP4T == null || YP4T.length == 0) {
    return YP4T
  }
  var bnR9I = new String(YP4T)
  var qM2x = []
  var bq6k = bnR9I.length / 2
  var bh6b = 0
  for (var i = 0; i < bq6k; i++) {
    var ow1x = parseInt(bnR9I.charAt(bh6b++), 16) << 4
    var oz1x = parseInt(bnR9I.charAt(bh6b++), 16)
    qM2x[i] = AR5W(ow1x + oz1x)
  }
  return qM2x
}
var bzr2x = function(cI7B) {
  if (cI7B == null || cI7B == undefined) {
    return cI7B
  }
  var Sw2x = encodeURIComponent(cI7B)
  var vm3x = []
  var bzq2x = Sw2x.length
  for (var i = 0; i < bzq2x; i++) {
    if (Sw2x.charAt(i) == '%') {
      if (i + 2 < bzq2x) {
        vm3x.push(bzw2x(Sw2x.charAt(++i) + '' + Sw2x.charAt(++i))[0])
      } else {
        throw new Error('1009')
      }
    } else {
      vm3x.push(Sw2x.charCodeAt(i))
    }
  }
  return vm3x
}
var csl5q = function(wd4h) {
  var bc6W = 0
  bc6W += (wd4h[0] & 255) << 24
  bc6W += (wd4h[1] & 255) << 16
  bc6W += (wd4h[2] & 255) << 8
  bc6W += wd4h[3] & 255
  return bc6W
}
var cGu8m = function(bc6W) {
  var wd4h = []
  wd4h[0] = (bc6W >>> 24) & 255
  wd4h[1] = (bc6W >>> 16) & 255
  wd4h[2] = (bc6W >>> 8) & 255
  wd4h[3] = bc6W & 255
  return wd4h
}
var csa5f = function(cT7M, bnO9F, bq6k) {
  var dD8v = []
  if (cT7M == null || cT7M.length == 0) {
    return dD8v
  }
  if (cT7M.length < bq6k) {
    throw new Error('1003')
  }
  for (var i = 0; i < bq6k; i++) {
    dD8v[i] = cT7M[bnO9F + i]
  }
  return dD8v
}
var bnM9D = function(cT7M, bnO9F, rH2x, crK5P, bq6k) {
  if (cT7M == null || cT7M.length == 0) {
    return rH2x
  }
  if (rH2x == null) {
    throw new Error('1004')
  }
  if (cT7M.length < bq6k) {
    throw new Error('1003')
  }
  for (var i = 0; i < bq6k; i++) {
    rH2x[crK5P + i] = cT7M[bnO9F + i]
  }
  return rH2x
}
var crz5E = function(bq6k) {
  var br6l = []
  for (var i = 0; i < bq6k; i++) {
    br6l[i] = 0
  }
  return br6l
}
var crq5v = [
  82,
  9,
  106,
  -43,
  48,
  54,
  -91,
  56,
  -65,
  64,
  -93,
  -98,
  -127,
  -13,
  -41,
  -5,
  124,
  -29,
  57,
  -126,
  -101,
  47,
  -1,
  -121,
  52,
  -114,
  67,
  68,
  -60,
  -34,
  -23,
  -53,
  84,
  123,
  -108,
  50,
  -90,
  -62,
  35,
  61,
  -18,
  76,
  -107,
  11,
  66,
  -6,
  -61,
  78,
  8,
  46,
  -95,
  102,
  40,
  -39,
  36,
  -78,
  118,
  91,
  -94,
  73,
  109,
  -117,
  -47,
  37,
  114,
  -8,
  -10,
  100,
  -122,
  104,
  -104,
  22,
  -44,
  -92,
  92,
  -52,
  93,
  101,
  -74,
  -110,
  108,
  112,
  72,
  80,
  -3,
  -19,
  -71,
  -38,
  94,
  21,
  70,
  87,
  -89,
  -115,
  -99,
  -124,
  -112,
  -40,
  -85,
  0,
  -116,
  -68,
  -45,
  10,
  -9,
  -28,
  88,
  5,
  -72,
  -77,
  69,
  6,
  -48,
  44,
  30,
  -113,
  -54,
  63,
  15,
  2,
  -63,
  -81,
  -67,
  3,
  1,
  19,
  -118,
  107,
  58,
  -111,
  17,
  65,
  79,
  103,
  -36,
  -22,
  -105,
  -14,
  -49,
  -50,
  -16,
  -76,
  -26,
  115,
  -106,
  -84,
  116,
  34,
  -25,
  -83,
  53,
  -123,
  -30,
  -7,
  55,
  -24,
  28,
  117,
  -33,
  110,
  71,
  -15,
  26,
  113,
  29,
  41,
  -59,
  -119,
  111,
  -73,
  98,
  14,
  -86,
  24,
  -66,
  27,
  -4,
  86,
  62,
  75,
  -58,
  -46,
  121,
  32,
  -102,
  -37,
  -64,
  -2,
  120,
  -51,
  90,
  -12,
  31,
  -35,
  -88,
  51,
  -120,
  7,
  -57,
  49,
  -79,
  18,
  16,
  89,
  39,
  -128,
  -20,
  95,
  96,
  81,
  127,
  -87,
  25,
  -75,
  74,
  13,
  45,
  -27,
  122,
  -97,
  -109,
  -55,
  -100,
  -17,
  -96,
  -32,
  59,
  77,
  -82,
  42,
  -11,
  -80,
  -56,
  -21,
  -69,
  60,
  -125,
  83,
  -103,
  97,
  23,
  43,
  4,
  126,
  -70,
  119,
  -42,
  38,
  -31,
  105,
  20,
  99,
  85,
  33,
  12,
  125,
]
var JG8y = 64
var Zr5w = 64
var bzi2x = 4
var crl5q = function(qE2x) {
  var bzh2x = []
  if (qE2x == null || qE2x == undefined || qE2x.length == 0) {
    return crz5E(Zr5w)
  }
  if (qE2x.length >= Zr5w) {
    return csa5f(qE2x, 0, Zr5w)
  } else {
    for (var i = 0; i < Zr5w; i++) {
      bzh2x[i] = qE2x[i % qE2x.length]
    }
  }
  return bzh2x
}
var crj4n = function(ZB5G) {
  if (ZB5G == null || ZB5G.length % JG8y != 0) {
    throw new Error('1005')
  }
  var bnL9C = []
  var bh6b = 0
  var crg4k = ZB5G.length / JG8y
  for (var i = 0; i < crg4k; i++) {
    bnL9C[i] = []
    for (var j = 0; j < JG8y; j++) {
      bnL9C[i][j] = ZB5G[bh6b++]
    }
  }
  return bnL9C
}
var crb4f = function(bzf2x) {
  var ow1x = (bzf2x >>> 4) & 15
  var oz1x = bzf2x & 15
  var bh6b = ow1x * 16 + oz1x
  return crq5v[bh6b]
}
var bze2x = function(bnK9B) {
  if (bnK9B == null) {
    return null
  }
  var bzc2x = []
  for (var i = 0, bq6k = bnK9B.length; i < bq6k; i++) {
    bzc2x[i] = crb4f(bnK9B[i])
  }
  return bzc2x
}
var bza2x = function(Jz8r, qE2x) {
  if (Jz8r == null) {
    return null
  }
  if (Jz8r.length == 0) {
    return []
  }
  if (Jz8r.length % JG8y != 0) {
    throw new Error('1005')
  }
  qE2x = crl5q(qE2x)
  var bnJ9A = qE2x
  var bnI9z = crj4n(Jz8r)
  var Ti2x = []
  var cpV4Z = bnI9z.length
  for (var i = 0; i < cpV4Z; i++) {
    var bnF9w = bze2x(bnI9z[i])
    bnF9w = bze2x(bnF9w)
    var bnE9v = bzG2x(bnF9w, bnJ9A)
    var cpQ4U = cun5s(bnE9v, cue5j(bnJ9A))
    bnE9v = bzG2x(cpQ4U, qE2x)
    bnM9D(bnE9v, 0, Ti2x, i * JG8y, JG8y)
    bnJ9A = bnI9z[i]
  }
  var byI1x = []
  bnM9D(Ti2x, Ti2x.length - bzi2x, byI1x, 0, bzi2x)
  var bq6k = csl5q(byI1x)
  if (bq6k > Ti2x.length) {
    throw new Error('1006')
  }
  var qM2x = []
  bnM9D(Ti2x, 0, qM2x, 0, bq6k)
  return qM2x
}
var cpH4L = function(bae5j, J6D) {
  if (bae5j == null) {
    return null
  }
  var byG1x = new String(bae5j)
  if (byG1x.length == 0) {
    return []
  }
  var Jz8r = bzw2x(byG1x)
  if (J6D == null || J6D == undefined) {
    throw new Error('1007')
  }
  var qE2x = bzr2x(J6D)
  return bza2x(Jz8r, qE2x)
}

// this.cpF4J = function(bae5j, J6D) {
//   var bnB9s = cpH4L(bae5j, J6D)
//   var Fz7s = new String(bzx2x(bnB9s))
//   var zk5p = []
//   var bnz9q = Fz7s.length / 2
//   var bh6b = 0
//   for (var i = 0; i < bnz9q; i++) {
//     zk5p.push('%')
//     zk5p.push(Fz7s.charAt(bh6b++))
//     zk5p.push(Fz7s.charAt(bh6b++))
//   }
//   return zk5p.join('')
// }
