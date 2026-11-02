'use strict';
const crypto = require('node:crypto');

/*
 * Parser seguro de expressões de dados.
 *
 * Gramática aceita (espaços são ignorados):
 *   expressão := dado (("+" | "-") (dado | inteiro))*
 *   dado      := [quantidade] "d" faces
 *   inteiro   := dígitos
 *
 * Exemplos: 3d8, 2d8+4, 1d20-2, 4d6+3, 2d10+1d8, 3d8+2d6+5.
 * Nunca usa eval/exec; qualquer caractere fora da gramática é rejeitado.
 */
const LIMITS = Object.freeze({
  expressionLength: 100,
  dice: 100,
  sides: 1000,
  terms: 20,
  constant: 100000
});

function parseDiceExpression(input) {
  const raw = String(input ?? '');
  const source = raw.trim();
  if (!source) throw new SyntaxError('Informe uma expressão de dados, como 2d20+5.');
  if (source.length > LIMITS.expressionLength) throw new RangeError(`A expressão pode ter até ${LIMITS.expressionLength} caracteres.`);
  // Impede que "2d6 4" vire silenciosamente "2d64": espaços só podem separar termos.
  if (/\d\s+\d/.test(source)) throw new SyntaxError('Separe números com + ou - (por exemplo, 2d6+4).');

  const compact = source.replace(/\s+/g, '');
  const terms = [];
  let index = 0;
  let totalDice = 0;

  if (compact[index] === '+' || compact[index] === '-') {
    if (compact[index] === '-') throw new SyntaxError('A expressão deve começar com um dado, por exemplo 1d20-2.');
    index += 1;
  }
  if (index >= compact.length) throw new SyntaxError('Use uma expressão como 2d20+5.');

  while (index < compact.length) {
    if (terms.length >= LIMITS.terms) throw new RangeError(`A expressão pode ter no máximo ${LIMITS.terms} termos.`);

    let digits = '';
    while (index < compact.length && /\d/.test(compact[index])) digits += compact[index++];

    if (compact[index] === 'd' || compact[index] === 'D') {
      index += 1;
      const count = digits === '' ? 1 : Number(digits);
      if (digits.length > 3) throw new RangeError('A quantidade de dados deve ter no máximo 3 dígitos.');
      if (!Number.isInteger(count) || count < 1) throw new RangeError(`A quantidade deve ser de 1 a ${LIMITS.dice} dados.`);
      if (count > LIMITS.dice) throw new RangeError(`A quantidade deve ser de 1 a ${LIMITS.dice} dados.`);

      let faceDigits = '';
      while (index < compact.length && /\d/.test(compact[index])) faceDigits += compact[index++];
      if (!faceDigits) throw new SyntaxError('Informe as faces do dado, como d8.');
      if (faceDigits.length > 4) throw new RangeError('As faces do dado devem ter no máximo 4 dígitos.');
      const sides = Number(faceDigits);
      if (!Number.isInteger(sides) || sides < 2) throw new RangeError('Cada dado deve ter de 2 a 1.000 faces.');
      if (sides > LIMITS.sides) throw new RangeError('Cada dado deve ter de 2 a 1.000 faces.');

      totalDice += count;
      if (totalDice > LIMITS.dice) throw new RangeError(`A expressão pode rolar no máximo ${LIMITS.dice} dados.`);
      terms.push({ type: 'dice', count, sides, sign: 1 });
    } else {
      if (!digits) throw new SyntaxError('Use uma expressão como 2d20+5.');
      if (digits.length > 6) throw new RangeError('Cada modificador deve ter no máximo 6 dígitos.');
      const value = Number(digits);
      if (!Number.isInteger(value) || value > LIMITS.constant) throw new RangeError(`Cada modificador deve ficar entre -${LIMITS.constant} e ${LIMITS.constant}.`);
      terms.push({ type: 'constant', value, sign: 1 });
    }

    if (index >= compact.length) break;
    const operator = compact[index];
    if (operator !== '+' && operator !== '-') throw new SyntaxError('Use apenas + ou - entre dados e modificadores.');
    index += 1;
    if (index >= compact.length) throw new SyntaxError('A expressão termina com um operador.');
    if (operator === '-') {
      // O sinal pertence ao próximo termo. Aceitamos "-" antes de dados ou de um número.
      if (compact[index] === '+' || compact[index] === '-') throw new SyntaxError('Não use dois operadores seguidos.');
      const next = terms.length;
      // Marca o próximo termo como negativo ao final da leitura.
      terms.push({ type: 'sign', value: -1 });
      // O próximo laço lê o termo; o marcador é consumido em normalizeTerms.
      void next;
    } else if (compact[index] === '+' || compact[index] === '-') {
      throw new SyntaxError('Não use dois operadores seguidos.');
    }
  }

  return normalizeTerms(terms, compact.startsWith('+') ? compact.slice(1) : compact, source);
}

function normalizeTerms(rawTerms, expression, source) {
  const groups = [];
  let modifier = 0;
  let pendingSign = 1;
  let sawDice = false;

  for (const term of rawTerms) {
    if (term.type === 'sign') { pendingSign = term.value; continue; }
    const sign = pendingSign;
    pendingSign = 1;
    if (term.type === 'dice') {
      sawDice = true;
      groups.push({ count: term.count, sides: term.sides, subtotal: 0, dice: [], sign });
    } else {
      modifier += term.value * sign;
    }
  }
  if (!sawDice) throw new SyntaxError('A expressão precisa conter pelo menos um dado, como 1d20.');
  if (Math.abs(modifier) > LIMITS.constant) throw new RangeError(`A soma dos modificadores deve ficar entre -${LIMITS.constant} e ${LIMITS.constant}.`);

  const result = {
    expression,
    source,
    terms: groups.map(group => ({ type: 'dice', count: group.count, sides: group.sides, sign: group.sign })).concat(modifier ? [{ type: 'constant', value: modifier }] : []),
    groups,
    dice: [],
    diceSum: 0,
    modifier,
    result: modifier
  };
  if (groups.length === 1) {
    result.count = groups[0].count;
    result.sides = groups[0].sides;
  }
  return result;
}

function rollDiceExpression(input, randomInt = crypto.randomInt) {
  const parsed = parseDiceExpression(input);
  let diceSum = 0;
  let result = parsed.modifier;
  const allDice = [];

  parsed.groups.forEach(group => {
    group.dice = Array.from({ length: group.count }, () => randomInt(1, group.sides + 1));
    if (group.dice.some(value => !Number.isInteger(value) || value < 1 || value > group.sides)) {
      throw new RangeError('A fonte de dados retornou um resultado inválido.');
    }
    group.subtotal = group.dice.reduce((sum, value) => sum + value, 0);
    diceSum += group.subtotal;
    result += group.subtotal * group.sign;
    allDice.push(...group.dice);
  });

  return { ...parsed, dice: allDice, diceSum, result };
}

module.exports = { parseDiceExpression, rollDiceExpression, LIMITS };
