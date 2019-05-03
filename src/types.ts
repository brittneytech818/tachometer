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

export class Deferred<T> {
  readonly promise: Promise<T>;
  resolve!: (value: T) => void;
  reject!: (error: Error) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

/**
 * A mapping from NPM package name to version specifier, as used in a
 * package.json's "dependencies" and "devDependencies".
 */
export interface PackageDependencyMap {
  [pkg: string]: string;
}

/**
 * The descriptor of a package version as specified by the --package-version
 * flag.
 */
export interface PackageVersion {
  label: string;
  dependencyOverrides: PackageDependencyMap;
}

/** The subset of the format of an NPM package.json file we care about. */
export interface NpmPackageJson {
  name: string;
  dependencies: PackageDependencyMap;
}

/** The kinds of intervals we can measure. */
export type Measurement = 'callback'|'fcp';

/** A specification of a benchmark to run. */
export interface BenchmarkSpec {
  url?: string;
  measurement: Measurement;
  name: string;
  queryString: string;
  implementation: string;
  version: PackageVersion;
  browser: string;
}

// Note: sync with client/src/index.ts
export interface BenchmarkResponse {
  millis: number;
}

export interface BenchmarkResult {
  name: string;
  queryString: string;
  implementation: string;
  version: string;
  millis: number[];
  browser: {name: string, version: string};
  bytesSent: number;
}

export interface BenchmarkSession {
  benchmarks: BenchmarkResult[];
  datetime: string;  // YYYY-MM-DDTHH:mm:ss.sssZ
  system: {
    cpu: {
      manufacturer: string,
      model: string,
      family: string,
      speed: string,
      cores: number,
    };
    load: {
      average: number,
      current: number,
    };
    battery: {
      hasBattery: boolean,
      connected: boolean,
    };
    memory: {
      total: number,
      free: number,
      used: number,
      active: number,
      available: number,
    };
  };
}
