import '@testing-library/jest-dom'
import { expect } from '@jest/globals';

import * as rules from '../src/app/rules';
import {cft, Suite} from '../src/app/rules';



it('builds test cards', () => {
  expect(cft('A', Suite.SPADES)).toBe(0);
  expect(cft('1', Suite.SPADES)).toBe(0);
  expect(cft('10', Suite.SPADES)).toBe(9);
  expect(cft('J', Suite.SPADES)).toBe(10);
  expect(cft('Q', Suite.SPADES)).toBe(11);
  expect(cft('K', Suite.SPADES)).toBe(12);

  expect(cft('A', Suite.HEARTS)).toBe(13);
  expect(cft('K', Suite.HEARTS)).toBe(25);

  expect(cft('A', Suite.DIAMONDS)).toBe(26);
  expect(cft('K', Suite.DIAMONDS)).toBe(38);

  expect(cft('A', Suite.CLUBS)).toBe(39);
  expect(cft('K', Suite.CLUBS)).toBe(51);
})

it('royal flush ties', () => {
  let hands =
  [ [cft('A', Suite.SPADES), cft('K', Suite.SPADES), cft('Q', Suite.SPADES), cft('J', Suite.SPADES), cft('10', Suite.SPADES)],
    [cft('A', Suite.HEARTS), cft('K', Suite.HEARTS), cft('Q', Suite.HEARTS), cft('J', Suite.HEARTS), cft('10', Suite.HEARTS)],
    [cft('A', Suite.DIAMONDS), cft('K', Suite.DIAMONDS), cft('Q', Suite.DIAMONDS), cft('J', Suite.DIAMONDS), cft('10', Suite.DIAMONDS)],
    [cft('A', Suite.CLUBS), cft('K', Suite.CLUBS), cft('Q', Suite.CLUBS), cft('J', Suite.CLUBS), cft('10', Suite.CLUBS)] ];
  const winners = rules.findWinners(hands);
  expect(winners).toStrictEqual([0, 1, 2, 3]);
  
})

it('highest card tie', () => {
  let hands =
  [ [cft('A', Suite.SPADES), cft('K', Suite.SPADES), cft('Q', Suite.SPADES), cft('J', Suite.SPADES), cft('8', Suite.HEARTS)],
    [cft('A', Suite.HEARTS), cft('K', Suite.HEARTS), cft('Q', Suite.HEARTS), cft('J', Suite.HEARTS), cft('5', Suite.SPADES)],
    [cft('A', Suite.DIAMONDS), cft('K', Suite.DIAMONDS), cft('Q', Suite.DIAMONDS), cft('J', Suite.DIAMONDS), cft('7', Suite.CLUBS)],
    [cft('A', Suite.CLUBS), cft('K', Suite.CLUBS), cft('Q', Suite.CLUBS), cft('J', Suite.CLUBS), cft('8', Suite.DIAMONDS)] ];
  const winners = rules.findWinners(hands);
  expect(winners).toStrictEqual([0, 3]);
})

it('highest card for equal pair with unique mismatched card', () => {
  let hands =
  [ [cft('A', Suite.SPADES), cft('K', Suite.SPADES), cft('Q', Suite.SPADES), cft('Q', Suite.HEARTS), cft('2', Suite.HEARTS)],
    [cft('A', Suite.DIAMONDS), cft('K', Suite.DIAMONDS), cft('4', Suite.DIAMONDS), cft('J', Suite.DIAMONDS), cft('7', Suite.CLUBS)],
    [cft('A', Suite.HEARTS), cft('K', Suite.HEARTS), cft('Q', Suite.DIAMONDS), cft('Q', Suite.CLUBS), cft('8', Suite.SPADES)],
    [cft('A', Suite.CLUBS), cft('K', Suite.CLUBS), cft('3', Suite.CLUBS), cft('J', Suite.CLUBS), cft('8', Suite.DIAMONDS)] ];
  const winners = rules.findWinners(hands);
  expect(winners).toStrictEqual([2]);
})

it('highest card for equal pair with same mismatched card', () => {
  let hands =
  [ [cft('A', Suite.SPADES), cft('K', Suite.SPADES), cft('Q', Suite.SPADES), cft('Q', Suite.HEARTS), cft('8', Suite.HEARTS)],
    [cft('A', Suite.DIAMONDS), cft('K', Suite.DIAMONDS), cft('4', Suite.DIAMONDS), cft('J', Suite.DIAMONDS), cft('7', Suite.CLUBS)],
    [cft('A', Suite.HEARTS), cft('K', Suite.HEARTS), cft('Q', Suite.DIAMONDS), cft('Q', Suite.CLUBS), cft('8', Suite.SPADES)],
    [cft('A', Suite.CLUBS), cft('K', Suite.CLUBS), cft('3', Suite.CLUBS), cft('J', Suite.CLUBS), cft('8', Suite.DIAMONDS)] ];
  const winners = rules.findWinners(hands);
  expect(winners).toStrictEqual([0,2]);
})
