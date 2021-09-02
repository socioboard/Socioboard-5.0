import jwt from 'jsonwebtoken';
import crypto from 'crypto';

function Authorize(authorizeConfig) {
  this.authorize = authorizeConfig;
  this.cipherKey = crypto.createHash('sha256').update(this.authorize.secret).digest();
}

Authorize.prototype.encrypt = function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(this.authorize.algorithm, new Buffer.from(this.cipherKey), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

Authorize.prototype.decrypt = function decrypt(text) {
  text = decodeURIComponent(text);
  const textParts = text.split(':');

  const iv = new Buffer.from(textParts.shift(), 'hex');
  const encryptedText = new Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(this.authorize.algorithm, new Buffer.from(this.cipherKey), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

Authorize.prototype.createToken = function (payload) {
  const header = {
    typ: 'JWT',
    alg: this.authorize.algorithm,
  };
  const token = jwt.sign({ token: payload, header }, this.authorize.token_secret, { expiresIn: 86400 });
  return token;
};

Authorize.prototype.verifyToken = function (token) {
  return jwt.verify(token, this.authorize.token_secret, (err, decoded) => {
    if (err) {
      const errorMessage = { auth: false, message: 'Failed to authenticate token.' };

      return errorMessage;
    }

    return JSON.stringify(decoded.token);
  });
};

export default Authorize;
