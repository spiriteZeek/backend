import jsonwebtoken from "jsonwebtoken";

const jwtSecret = 'zeekjet';
const jwtExpiresIn = '1h';

export function sign(payload) {
  return jsonwebtoken.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
}

export function verify(token) {
  return jsonwebtoken.verify(token, jwtSecret);
}