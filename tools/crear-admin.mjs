// Genera la fila de una cuenta del panel para pegarla en la pestaña
// «Administradores» de la hoja de Google. No guarda nada ni se conecta a
// ningún servicio: solo calcula sal + hash en esta terminal.
//
//   node tools/crear-admin.mjs --usuario admin.demo --nombre "Admin Demo"
//
// La contraseña sale de la variable ADMIN_PASSWORD si existe; si no, se genera
// una aleatoria y se muestra UNA sola vez. Guárdala en tu gestor de contraseñas.
// Formato que verifica el flujo de n8n: hash = sha256(salt + contraseña) en hex.

import { randomBytes, createHash } from 'node:crypto';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { usuario: { type: 'string' }, nombre: { type: 'string' } } });
const usuario = values.usuario?.trim().toLowerCase();
const nombre = values.nombre?.trim() || usuario;
if (!usuario || !/^[a-z0-9._-]{3,40}$/.test(usuario)) {
  console.error('Indica --usuario (3 a 40 caracteres: letras, números, punto, guion o guion bajo).');
  process.exit(1);
}
const fromEnv = process.env.ADMIN_PASSWORD;
if (fromEnv && fromEnv.length < 12) {
  console.error('ADMIN_PASSWORD debe tener al menos 12 caracteres.');
  process.exit(1);
}
const clave = fromEnv || randomBytes(15).toString('base64url');
const salt = randomBytes(16).toString('hex');
const hash = createHash('sha256').update(salt + clave).digest('hex');

console.log('\nPega esta fila en la pestaña «Administradores» (columnas usuario · nombre · salt · hash · activo):\n');
console.log([usuario, nombre, salt, hash, 'sí'].join('\t'));
if (!fromEnv) console.log(`\nContraseña generada (no se vuelve a mostrar): ${clave}\n`);
