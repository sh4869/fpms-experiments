import { LockFileObject, parse } from "@yarnpkg/lockfile";
import { ProcessResult, RequestResult } from "./type";
import { exec } from "child_process";
import { readFileSync } from "fs";
import { sep } from "path";
import { promisify } from "util";
import { cleanYarn, countDeps, findVersion } from "./yarn_funcs";
import { createTmpDir, prepareDir, removeTmpDir } from "./files_funcs";

export const runAdd = async (
  command: "fpms" | "yarn",
  name: string,
  debug: boolean = false
): Promise<RequestResult> => {
  // 準備
  const dir = prepare(name);
  // 実行
  const result = await execAddCommand(command, name, dir, debug);
  // 後処理
  return after(result, name, dir);
};

const execAddCommand = async (
  command: string,
  name: string,
  dir: string,
  debug: boolean = false
): Promise<ProcessResult> => {
  const start = process.hrtime.bigint();
  const result = await promisify(exec)(`${command} add ${name}`, {
    cwd: dir,
    env: { ...process.env },
  });
  const end = process.hrtime.bigint();
  console.log(result.stdout);
  console.log("----------------------------------------------");
  const file = readFileSync(`${dir}${sep}yarn.lock`).toString();
  return { mill: Number(end - start) / 1000000, yarnlock: parse(file).object as LockFileObject };
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
  cleanYarn();
  const count = countDeps(result.yarnlock);
  // バージョン
  const version = findVersion(result.yarnlock, name);
  // tmpdirの削除
  removeTmpDir(dir);
  return { mill: result.mill, depscount: count, version: version };
};
