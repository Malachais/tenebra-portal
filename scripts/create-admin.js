'use strict';
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const { initialize, ensureAdmin, closeDatabase } = require('../server');

function hiddenPrompt(label) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') throw new Error('Execute este comando em um terminal interativo.');
  stdout.write(label);
  stdin.setRawMode(true); stdin.resume(); stdin.setEncoding('utf8');
  return new Promise((resolve, reject) => {
    let value = '';
    const finish = (error) => { stdin.removeListener('data', onData); stdin.setRawMode(false); stdout.write('\n'); error ? reject(error) : resolve(value); };
    const onData = (chunk) => { for (const char of chunk) {
      if (char === '\u0003') return finish(new Error('Operação cancelada.'));
      if (char === '\r' || char === '\n') return finish();
      if (char === '\u007f' || char === '\b') { if (value.length) { value = value.slice(0, -1); stdout.write('\b \b'); } continue; }
      if (char >= ' ' && char !== '\u007f') { value += char; stdout.write('•'); }
    } };
    stdin.on('data', onData);
  });
}

(async () => {
  try {
    await initialize();
    let admin = await ensureAdmin('merjin');
    if (admin.needsPassword) {
      const password = process.env.ADMIN_INITIAL_PASSWORD || await hiddenPrompt('Senha inicial para merjin (mínimo 12 caracteres): ');
      if (!process.env.ADMIN_INITIAL_PASSWORD) {
        const confirmation = await hiddenPrompt('Confirme a senha: ');
        if (password !== confirmation) throw new Error('As senhas não coincidem.');
      }
      admin = await ensureAdmin('merjin', password);
    }
    console.log(admin.created ? 'Administrador "merjin" criado.' : 'Administrador "merjin" confirmado; a senha existente foi preservada.');
  } catch (error) {
    console.error(error.message || 'Não foi possível garantir o administrador.');
    process.exitCode = 1;
  } finally { await closeDatabase(); }
})();
