import bcrypt from 'bcryptjs';

// Generar hashes para las contraseñas
const passwords = {
  'super123': bcrypt.hashSync('super123', 10),
  'admin123': bcrypt.hashSync('admin123', 10),
  'cajero123': bcrypt.hashSync('cajero123', 10)
};

console.log('='.repeat(60));
console.log('CONTRASEÑAS HASHEADAS PARA SQL:');
console.log('='.repeat(60));
console.log('\nSuper Admin (super123):');
console.log(passwords['super123']);
console.log('\nAdmin (admin123):');
console.log(passwords['admin123']);
console.log('\nCajero (cajero123):');
console.log(passwords['cajero123']);
console.log('\n' + '='.repeat(60));
