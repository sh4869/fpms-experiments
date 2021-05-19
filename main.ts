import { readFileSync, writeFileSync } from "fs";
import { runAdd } from "./src/add";
import { PackageExperimentResult } from "./src/type";
import { configure, getLogger } from "log4js";
import dayjs from "dayjs";

const COUNT_OF_EXPERIMENTS = 3;
const RESULT_PER_FILE = 5000;
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
  for(let i = 0;i < names.length / RESULT_PER_FILE; i++){
    logger.info(`start ${i}/${names.length / RESULT_PER_FILE}`)
    const start = i * RESULT_PER_FILE;
    const end = (i + 1) * RESULT_PER_FILE > names.length ? names.length : start + RESULT_PER_FILE;
    let result = [];
    for(let j = start;j < end;j++){
      result.push(await experiment(names[j]));
    }
    writeFileSync(`result/${i}.json`, JSON.stringify(result));
  }
};

configure({
  appenders: { experiments: { type: "file", filename: `logs/log_${dayjs().format("YYYYMMDD_HHmmss")}.log` } },
  categories: { default: { appenders: ["experiments"], level: "info" } },
});

main();
