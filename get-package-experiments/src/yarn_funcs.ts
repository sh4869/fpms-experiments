import { LockFileObject } from "@yarnpkg/lockfile";
import { SemVer } from "semver";
import { execSync } from "child_process";

export const cleanYarn = (): void => {
  execSync("yarn cache clean");
};

export const findVersion = (lockfile: LockFileObject, name: string): string => {
  const keys = Object.entries(lockfile).filter((v) => v[0].startsWith(name));
  if (keys.length == 0) {
    throw new Error(`${name} package not found in lockfile object`);
  } else if (keys.length == 1) {
    return keys[0][1].version;
  } else {
    return keys.sort((a, b) => new SemVer(a[1].version).compare(b[1].version))[0][1].version;
  }
};

export const countDeps = (lockfile: LockFileObject): number => {
  let set = new Set<string>();
  for (const i of Object.entries(lockfile)) {
    // "@yarnpkg/lockfile"のようなパッケージの場合、"@yarnpkg/lockfile@1.0.0"と書かれているのでそれを考慮する必要がある
    const name = i[0][0] === "@" ? "@" + i[0].substr(1).split("@")[0] : i[0].split("@")[0];
    const version = i[1].version;
    set.add(name + "@" + version);
  }
  return set.size;
};
