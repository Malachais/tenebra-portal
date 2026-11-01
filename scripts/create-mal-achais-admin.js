'use strict';
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
      if (char === '\u007f' || char === '\b') { if (value.length) value = value.slice(0, -1); continue; }
      if (char >= ' ' && char !== '\u007f') value += char;
    } };
    stdin.on('data', onData);
  });
}

(async () => {
  try {
    await initialize();
    const password = process.env.ADMIN_INITIAL_PASSWORD || await hiddenPrompt('Senha para malachais: ');
    if (!process.env.ADMIN_INITIAL_PASSWORD) {
      const confirmation = await hiddenPrompt('Confirme a senha: ');
      if (password !== confirmation) throw new Error('As senhas não coincidem.');
    }
    const result = await ensureAdmin('malachais', password);
    console.log(result.created ? 'Administrador malachais criado com hash seguro.' : 'Conta malachais promovida a admin e senha redefinida com hash seguro.');
  } catch (error) {
    const code = error.code || error.errors?.find(item => item.code)?.code;
    const safe = ['Senha', 'usuário', 'caracteres', 'coincidem', 'terminal'].some(word => error.message?.includes(word));
    console.error(safe ? error.message : `Não foi possível atualizar o administrador${code ? ` (${code})` : ''}.`);
    process.exitCode = 1;
  } finally { await closeDatabase(); }
})();
