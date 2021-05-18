import { readFileSync, writeFileSync } from "fs";
import { runAdd } from "./src/add";
import { PackageExperimentResult } from "./src/type";
import { configure, getLogger } from "log4js";
import dayjs from "dayjs";

const COUNT_OF_EXPERIMENTS = 3;
const logger = getLogger();

const experiment = async (name: string): Promise<PackageExperimentResult> => {
  const fpmsresult = [];
  const yarnresult = [];
  logger.info(`start experiments: ${name}`);
  for (let i = 0; i < COUNT_OF_EXPERIMENTS; i++) {
    try {
      const r = await runAdd("fpms", name);
      fpmsresult.push(r);
    } catch (e) {
      logger.error(`error on fpms and ${name}`, e);
    }
    try {
      const r2 = await runAdd("yarn", name);
      yarnresult.push(r2);
    } catch (e) {
      logger.error(`error on yarn and ${name}`, e);
    }
  }
  return { name, fpmsresult, yarnresult };
};

const main = async () => {
  const names = JSON.parse(readFileSync(process.argv[2]).toString()) as string[];
  let result = [];
  for (const name of names) {
    result.push(await experiment(name));
  }
  writeFileSync("result.json", JSON.stringify(result));
};

configure({
  appenders: { experiments: { type: "file", filename: `logs/log_${dayjs().format("YYYYMMDD_HHmmss")}.log` } },
  categories: { default: { appenders: ["experiments"], level: "info" } },
});

main();
