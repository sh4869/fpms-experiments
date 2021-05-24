import { readFileSync } from "fs";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { createInterface } from "readline";
import { resolve } from "path/posix";
dayjs.extend(customParseFormat);

// 14:43:24.159 [ioapp-compute-10] INFO  f.c.RedisDependencyCalculator - rds is saved
const regexp = /([0-9\.\:]+) (\[[^\]]+\]) ([A-Z]+)  ([a-zA-Z\.]+\$?) - (.*)$/;

type Log = {
  date: Dayjs;
  content: string;
};

const parse = (log: string) => {
  return log.split("\n").map((v) => {
    const z = v.match(regexp);
    if (z !== null && z.length === 6) {
      return {
        date: dayjs(z[1], "HH:mm:ss.SSS"),
        content: z[5],
      };
    } else {
      return { date: dayjs(), content: "" };
    }
  });
};

const diff = (v1: string, v2: string, log: Log[]) => {
  const one = log.filter((v) => v.content.startsWith(v1))[0];
  const two = log.filter((v) => v.content.startsWith(v2))[0];
  if (two.date.isAfter(one.date)) {
    console.log(`${two.date.diff(one.date, "millisecond") / 1000} s`);
  } else {
    console.log(
      `${two.date.add(1, "day").diff(one.date, "millisecond") / 1000}`
    );
  }
};

const q = async (question: string): Promise<string> => {
  const i = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    i.question(question, (answer) => {
      resolve(answer);
      i.close();
    });
  });
};

const main = async () => {
  const log = readFileSync(process.argv[2]).toString();
  const logs = parse(log);
  const one = await q("first event:");
  const two = await q("second event:");
  diff(one, two, logs);
};

main();
