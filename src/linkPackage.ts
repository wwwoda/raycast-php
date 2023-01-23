import util from "util";
import child from "child_process";
const exec = util.promisify(child.exec);
import { Package } from "./types";
import { handleError } from "./util";

type SuccessHandler = (pkg: Package) => void;

export default async (pkg: Package, pkgs: Package[], onSuccess: SuccessHandler) => {
  const commands: string[] = [];

  pkgs.forEach((upkg) => {
    if (pkg.current) {
      return;
    }
    commands.push(`brew unlink ${upkg.packageName}`);
  });

  commands.push(`brew link ${pkg.packageName}`);

  try {
    const { stderr } = await exec(commands.join(" && "));

    if (stderr) {
      handleError(stderr, `Error linking PHP ${pkg.simpleVersion}`);
      return;
    }

    onSuccess(pkg);
  } catch (error) {
    console.error(error);
  }
};