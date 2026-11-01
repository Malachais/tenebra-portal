'use strict';
const crypto = require('node:crypto');

function parseDiceExpression(input) {
  const source = String(input ?? '').trim();
  if (source.length > 80) throw new RangeError('A expressão pode ter até 80 caracteres.');
  const match = source.match(/^(\d{1,3})\s*d\s*(\d{1,4})(?:\s*([+-])\s*(\d{1,6}))?$/i);
  if (!match) throw new SyntaxError('Use uma expressão como 2d20+5.');
  const count = Number(match[1]), sides = Number(match[2]);
  const modifier = match[4] ? Number(match[4]) * (match[3] === '-' ? -1 : 1) : 0;
  if (count < 1 || count > 100) throw new RangeError('A quantidade deve ser de 1 a 100 dados.');
  if (sides < 2 || sides > 1000) throw new RangeError('Cada dado deve ter de 2 a 1.000 faces.');
  if (Math.abs(modifier) > 100000) throw new RangeError('O modificador deve ficar entre -100.000 e 100.000.');
  return { count, sides, modifier, expression: `${count}d${sides}${modifier ? `${modifier > 0 ? '+' : ''}${modifier}` : ''}` };
}

function rollDiceExpression(input, randomInt = crypto.randomInt) {
  const parsed = parseDiceExpression(input);
  const dice = Array.from({ length: parsed.count }, () => randomInt(1, parsed.sides + 1));
  if (dice.some(value => !Number.isInteger(value) || value < 1 || value > parsed.sides)) throw new RangeError('A fonte de dados retornou um resultado inválido.');
  const diceSum = dice.reduce((sum, value) => sum + value, 0);
  return { ...parsed, dice, diceSum, result: diceSum + parsed.modifier };
}

module.exports = { parseDiceExpression, rollDiceExpression };
