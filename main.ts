import { fstat, readFileSync, writeFileSync } from "fs";
import { runAdd } from "./src/add";
import { PackageExperimentResult } from "./src/type";

const COUNT_OF_EXPERIMENTS = 3;

const experiment = (name: string): PackageExperimentResult => {
  const fpmsresult = [];
  const yarnresult = [];
  for (let i = 0; i < COUNT_OF_EXPERIMENTS; i++) {
    fpmsresult.push(runAdd("fpms", name));
    yarnresult.push(runAdd("yarn", name));
  }
  return { name, fpmsresult, yarnresult };
};

const main = () => {
  const names = JSON.parse(readFileSync(process.argv[2]).toString()) as string[];
  const results = names.map((n) => experiment(n));
  writeFileSync("result.json", JSON.stringify(results));
};

main();
