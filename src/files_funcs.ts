import { writeFileSync, rmdirSync, mkdtempSync } from "fs";
import { tmpdir } from "os";
import { sep } from "path";

export const createTmpDir = (name: string): string => {
  const tmp = tmpdir();
  return mkdtempSync(`${tmp}${sep}${name}`);
};

export const removeTmpDir = (path: string): void => {
  rmdirSync(path);
};

export const prepareDir = (path: string): void => {
  writeFileSync(`${path}${sep}package.json`, packageJson);
};

const packageJson = `
  {
      "name": "test",
      "version": "1.0.0",
      "description": "",
      "main": "index.js",
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "keywords": [],
      "author": "",
      "license": "ISC"
    }
    
  `;
