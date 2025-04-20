const bcrypt = require('bcryptjs');

const password = 'Password1';
const hashed = bcrypt.hashSync(password, 10);

console.log('Original:', password);
console.log('Hash:', hashed);
console.log('Compare:', bcrypt.compareSync(password, hashed));
