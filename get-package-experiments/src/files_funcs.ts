import { writeFileSync, mkdtempSync } from "fs";
import { tmpdir } from "os";
import { sep } from "path";
import rmiraf from "rimraf";

export const createTmpDir = (name: string): string => {
  const tmp = tmpdir();
  return mkdtempSync(`${tmp}${sep}${name}`);
};

export const removeTmpDir = (path: string): void => {
  rmiraf.sync(path);
};

export const prepareDir = (path: string): void => {
  writeFileSync(`${path}${sep}package.json`, packageJson);
};

const packageJson = `{
  "name": "test",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "dependencies": {},
  "keywords": [],
  "author": "",
  "license": "ISC"
}`;
