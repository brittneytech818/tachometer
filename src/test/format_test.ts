/**
 * @license
 * Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
 * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
 * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
 * Google as part of the polymer project is also subject to an additional IP
 * rights grant found at http://polymer.github.io/PATENTS.txt
 */

import {assert} from 'chai';
import * as path from 'path';
import stripAnsi = require('strip-ansi');

import {ConfigFile} from '../configfile';
import {automaticResultTable, verticalTermResultTable} from '../format';
import {fakeResults, testData} from './test_helpers';

/**
 * Given a config file object, generates fake measurement results, and returns
 * the terminal formatted result table that would be printed (minus color etc.
 * formatting).
 */
async function fakeResultTable(configFile: ConfigFile): Promise<string> {
  const results = await fakeResults(configFile);
  const resultTable = automaticResultTable(results).unfixed;
  return stripAnsi(verticalTermResultTable(resultTable));
}

suite('format', () => {
  let prevCwd: string;
  suiteSetup(() => {
    prevCwd = process.cwd();
    process.chdir(path.join(testData, 'mylib'));
  });

  suiteTeardown(() => {
    process.chdir(prevCwd);
  });

  test('1 remote', async () => {
    const config: ConfigFile = {
      benchmarks: [
        {
          url: 'http://example.com',
          browser: {
            name: 'chrome',
          },
        },
      ],
    };

    const actual = await fakeResultTable(config);
    const expected = `
┌──────────────────┐
│         Avg time │
├──────────────────┤
│ 8.56ms - 11.44ms │
└──────────────────┘
    `;
    assert.equal(actual, expected.trim() + '\n');
  });

  test('2 remote, 2 browsers', async () => {
    const config: ConfigFile = {
      benchmarks: [
        {
          url: 'http://example.com',
          browser: {
            name: 'chrome',
          },
        },
        {
          url: 'http://example.com',
          browser: {
            name: 'firefox',
          },
        },
      ],
    };

    const actual = await fakeResultTable(config);
    const expected = `
┌───────────────┬──────────┬───────────────────┬──────────────────┬──────────────────┐
│ Browser       │ Bytes    │          Avg time │        vs chrome │       vs firefox │
├───────────────┼──────────┼───────────────────┼──────────────────┼──────────────────┤
│ chrome        │ 1.00 KiB │  8.56ms - 11.44ms │                  │           faster │
│ 75.0.3770.100 │          │                   │         -        │        42% - 58% │
│               │          │                   │                  │ 7.97ms - 12.03ms │
├───────────────┼──────────┼───────────────────┼──────────────────┼──────────────────┤
│ firefox       │ 2.00 KiB │ 18.56ms - 21.44ms │           slower │                  │
│ 60.0          │          │                   │       68% - 132% │         -        │
│               │          │                   │ 7.97ms - 12.03ms │                  │
└───────────────┴──────────┴───────────────────┴──────────────────┴──────────────────┘
    `;
    assert.equal(actual, expected.trim() + '\n');
  });

  test('remote and local, with query params, without labels', async () => {
    const config: ConfigFile = {
      benchmarks: [
        {
          url: 'http://example.com?p=bar',
          browser: {
            name: 'chrome',
          },
        },
        {
          url: 'mybench/index.html?p=bar',
          browser: {
            name: 'chrome',
          },
        },
      ],
    };

    const actual = await fakeResultTable(config);
    const expected = `
┌───────────────────────────┬──────────┬───────────────────┬─────────────────────────────┬──────────────────────────────┐
│ Benchmark                 │ Bytes    │          Avg time │ vs http://example.com?p=bar │ vs /mybench/index.html?p=bar │
├───────────────────────────┼──────────┼───────────────────┼─────────────────────────────┼──────────────────────────────┤
│ http://example.com?p=bar  │ 1.00 KiB │  8.56ms - 11.44ms │                             │                       faster │
│                           │          │                   │                    -        │                    42% - 58% │
│                           │          │                   │                             │             7.97ms - 12.03ms │
├───────────────────────────┼──────────┼───────────────────┼─────────────────────────────┼──────────────────────────────┤
│ /mybench/index.html?p=bar │ 2.00 KiB │ 18.56ms - 21.44ms │                      slower │                              │
│                           │          │                   │                  68% - 132% │                     -        │
│                           │          │                   │            7.97ms - 12.03ms │                              │
└───────────────────────────┴──────────┴───────────────────┴─────────────────────────────┴──────────────────────────────┘
    `;
    assert.equal(actual, expected.trim() + '\n');
  });

  test('remote and local, with query params, with labels', async () => {
    const config: ConfigFile = {
      benchmarks: [
        {
          name: 'foo',
          url: 'http://example.com?p=bar',
          browser: {
            name: 'chrome',
          },
        },
        {
          name: 'bar',
          url: 'mybench/index.html?p=bar',
          browser: {
            name: 'chrome',
          },
        },
      ],
    };

    const actual = await fakeResultTable(config);
    const expected = `
┌───────────┬──────────┬───────────────────┬──────────────────┬──────────────────┐
│ Benchmark │ Bytes    │          Avg time │           vs foo │           vs bar │
├───────────┼──────────┼───────────────────┼──────────────────┼──────────────────┤
│ foo       │ 1.00 KiB │  8.56ms - 11.44ms │                  │           faster │
│           │          │                   │         -        │        42% - 58% │
│           │          │                   │                  │ 7.97ms - 12.03ms │
├───────────┼──────────┼───────────────────┼──────────────────┼──────────────────┤
│ bar       │ 2.00 KiB │ 18.56ms - 21.44ms │           slower │                  │
│           │          │                   │       68% - 132% │         -        │
│           │          │                   │ 7.97ms - 12.03ms │                  │
└───────────┴──────────┴───────────────────┴──────────────────┴──────────────────┘
    `;
    assert.equal(actual, expected.trim() + '\n');
  });
});
