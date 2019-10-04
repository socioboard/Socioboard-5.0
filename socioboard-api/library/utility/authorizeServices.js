const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function Authorize(authorizeConfig) {
    this.authorize = authorizeConfig;
    this.cipherKey = crypto.createHash('sha256').update(this.authorize.secret).digest();
}

Authorize.prototype.encrypt = function encrypt(text) {
    let iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv(this.authorize.algorithm, new Buffer.from(this.cipherKey), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

Authorize.prototype.decrypt = function decrypt(text) {
    text = decodeURIComponent(text);
    let textParts = text.split(':');
    let iv = new Buffer.from(textParts.shift(), 'hex');
    let encryptedText = new Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(this.authorize.algorithm, new Buffer.from(this.cipherKey), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

Authorize.prototype.createToken = function (payload) {
    var header = {
        "typ": "JWT",
        "alg": this.authorize.algorithm
    };
    var token = jwt.sign({ token: payload, header: header }, this.authorize.token_secret, { expiresIn: 86400 });
    
    return token;
 // return this.encrypt(token);
};

Authorize.prototype.verifyToken = function (token) {
    //token = this.decrypt(token);
    return jwt.verify(token, this.authorize.token_secret, function (err, decoded) {
        if (err) {
            var errorMessage = { auth: false, message: 'Failed to authenticate token.' };
            return errorMessage;
        } else {
            return JSON.stringify(decoded.token);
        }
    });
};

module.exports = Authorize;






