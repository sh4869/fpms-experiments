import { LockFileObject, parse } from "@yarnpkg/lockfile";
import { ProcessResult, RequestResult } from "./type";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { sep } from "path";
import { cleanYarn, countDeps, findVersion } from "./yarn_funcs";
import { createTmpDir, prepareDir, removeTmpDir } from "./files_funcs";

export const runAdd = (command: "fpms" | "yarn", name: string): RequestResult => {
  // 準備
  const dir = prepare(name);
  // 実行
  const result = execAddCommand(command, name, dir);
  // 後処理
  return after(result, name, dir);
};

const execAddCommand = (command: string, name: string, dir: string): ProcessResult => {
  const start = process.hrtime.bigint();
  execSync(`${command} add ${name}`, { cwd: dir });
  const end = process.hrtime.bigint();
  const file = readFileSync(`${dir}${sep}yarn.lock`).toString();
  return { mill: Number(start - end), yarnlock: parse(file).object as LockFileObject };
};

const prepare = (name: string): string => {
  cleanYarn();
  // tmpdirの作成
  const dir = createTmpDir(name);
  // Dirの準備
  prepareDir(dir);
  return dir;
};

const after = (result: ProcessResult, name: string, dir: string): RequestResult => {
  const count = countDeps(result.yarnlock);
  // バージョン
  const version = findVersion(result.yarnlock, name);
  // tmpdirの削除
  removeTmpDir(dir);
  return { mill: result.mill, depscount: count, version: version };
};
