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
      logger.error(`error on fpms and ${name}`, (e as any).message);
      break;
    }
    try {
      const r2 = await runAdd("yarn", name);
      yarnresult.push(r2);
    } catch (e) {
      logger.error(`error on yarn and ${name}`, (e as any).message);
      break;
    }
  }
  return { name, fpmsresult, yarnresult };
};

const CSV_HEADER = `package,version,depcount,${new Array(COUNT_OF_EXPERIMENTS)
  .fill(0)
  .map((_, i) => `yarn${i}`)
  .join(",")},${new Array(COUNT_OF_EXPERIMENTS)
  .fill(0)
  .map((_, i) => `fpms${i}`)
  .join(",")},yarn_ave,fpms_ave,diff`;

const main = async () => {
  const names = JSON.parse(readFileSync(process.argv[2]).toString()) as string[];
  for (let i = 0; i < names.length / RESULT_PER_FILE; i++) {
    const start = i * RESULT_PER_FILE;
    const end = (i + 1) * RESULT_PER_FILE > names.length ? names.length : start + RESULT_PER_FILE;
    logger.info(`start ${start} ~ ${end} (all package length: ${names.length})`);
    let result = [];
    for (let j = start; j < end; j++) {
      if (j % 100 === 0) logger.info(`${j}`);
      const v = await experiment(names[j]);
      result.push(v);
    }
    const toCSV = result
      .filter((z) => z.yarnresult.length > 0 && z.fpmsresult.length > 0)
      .map((v) => {
        const yarn_ave = v.yarnresult.map((v) => v.mill).reduce((l, r) => l + r, 0) / COUNT_OF_EXPERIMENTS;
        const fpms_ave = v.fpmsresult.map((v) => v.mill).reduce((l, r) => l + r, 0) / COUNT_OF_EXPERIMENTS;
        const diff = yarn_ave - fpms_ave;
        return `${v.name},${v.yarnresult[0].version},${v.yarnresult[0].depscount},${v.yarnresult
          .map((v) => v.mill)
          .join(",")},${v.fpmsresult.map((v) => v.mill).join(",")},${yarn_ave},${fpms_ave},${diff}`;
      })
      .join("\n");
    writeFileSync(`result/result${i}.csv`, `${CSV_HEADER}\n${toCSV}`);
  }
};

configure({
  appenders: { experiments: { type: "file", filename: `logs/log_${dayjs().format("YYYYMMDD_HHmmss")}.log` } },
  categories: { default: { appenders: ["experiments"], level: "info" } },
});

main();
