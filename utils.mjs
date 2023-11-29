import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });

const red = text => "\x1b[91m" + text + "\x1b[0m";
const green = text => "\x1b[92m" + text + "\x1b[0m";
const blue = text => "\x1b[94m" + text + "\x1b[0m";
const purple = text => "\x1b[95m" + text + "\x1b[0m";

import util from "util";
const deb = x => util.inspect(x, { depth: null });
export  default deb;

export  {
    deb,
    red,
    green,
    blue,
    purple,
    rl
}