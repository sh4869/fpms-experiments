import { readFileSync, writeFileSync } from "fs";
import { runAdd } from "./src/add";
import { PackageExperimentResult } from "./src/type";
import { configure, getLogger } from "log4js";
import dayjs from "dayjs";

const COUNT_OF_EXPERIMENTS = 10;
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
  for (let i = 0; i < names.length / RESULT_PER_FILE; i++) {
    logger.info(`start ${i}/${names.length / RESULT_PER_FILE}`);
    const start = i * RESULT_PER_FILE;
    const end = (i + 1) * RESULT_PER_FILE > names.length ? names.length : start + RESULT_PER_FILE;
    let result = [];
    for (let j = start; j < end; j++) {
      result.push(await experiment(names[j]));
    }
    writeFileSync(
      `result/result.csv`,
      "package,version,depcount,yarn1,yarn2,yarn3,yarn4,yarn5,yarn6,yarn7,yarn8,yarn9,yarn10,fpms1,fpms2,fpms3,fpms4,fpms5,fpms6,fpsm7,fpms8,fpms9,fpms10\n" +
        result
          .filter((z) => z.yarnresult.length > 0)
          .map(
            (v) =>
              `${v.name},${v.yarnresult[0].version},${v.yarnresult[0].depscount},${v.yarnresult
                .map((v) => v.mill)
                .join(",")},${v.fpmsresult.map((v) => v.mill).join(",")}`
          )
          .join("\n")
    );
  }
};

configure({
  appenders: { experiments: { type: "file", filename: `logs/log_${dayjs().format("YYYYMMDD_HHmmss")}.log` } },
  categories: { default: { appenders: ["experiments"], level: "info" } },
});

main();
