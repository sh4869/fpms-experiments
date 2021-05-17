import { LockFileObject } from "@yarnpkg/lockfile";

export type RequestResult = {
  mill: number;
  depscount: number;
  version: string;
};

export type PackageExperimentResult = {
  name: string;
  fpmsresult: RequestResult[];
  yarnresult: RequestResult[];
};

export type ProcessResult = {
  mill: number;
  yarnlock: LockFileObject;
};
