import util from "util";
import child from "child_process";
const exec = util.promisify(child.exec);
import { Package } from "./types";
import { handleError, versionsMatch } from "./util";
import getCurrentPhpVersion from "./getCurrentPhpVersion";

type SuccessHandler = (pkg: Package) => void;

export default async (linkPackage: Package, packages: Package[], onSuccess: SuccessHandler) => {
  const commands: string[] = [];
  const currentPhpVersion = await getCurrentPhpVersion();

  if (!currentPhpVersion) {
    handleError(new Error("Could not get current PHP version"));
    return;
  }

  packages.forEach((pkg) => {
    if (versionsMatch(linkPackage, pkg)) {
      return;
    }
    commands.push(`brew unlink ${pkg.packageName}`);
  });

  commands.push(`brew link ${linkPackage.packageName}`);

  try {
    const { stderr } = await exec(commands.join(" && "));

    if (stderr) {
      handleError(new Error(stderr), `Error linking PHP ${linkPackage.simpleVersion}`);
      return;
    }

    onSuccess(linkPackage);
  } catch (error) {
    console.error(error);
  }
};
