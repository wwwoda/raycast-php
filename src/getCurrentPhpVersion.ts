import util from "util";
import child from "child_process";
const exec = util.promisify(child.exec);
import { phpVersionRegex, versionFromString } from "./util";

export default async () => {
  try {
    const { stdout, stderr } = await exec("/usr/local/bin/php -v");

    if (!stdout && stderr) {
      return null;
    }

    const phpVersion = phpVersionRegex.exec(stdout);

    if (!phpVersion || !phpVersion[1]) {
      return null;
    }

    const version = versionFromString(phpVersion[1]);

    if (!version) {
      return null;
    }

    return version;
  } catch (error) {
    console.error(error);
  }
  return null;
};
