const encrypt = require('@magicdawn/music-api/src/crypto').aesRsaEncrypt

// https://github.com/LIU9293/musicAPI/blob/9b75830249b03599817b792c4cb05ded13a50949/src/netease/getSong#L11
export default function encryptViaApi(reqbody) {
  return encrypt(JSON.stringify(reqbody))
}
