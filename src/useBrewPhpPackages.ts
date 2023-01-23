import { useExec } from "@raycast/utils";
import { useEffect, useState } from "react";
import { Package, Version } from "./types";
import { packageFromString, phpPackageRegex } from "./util";

export default (currentPhpVersion: Version | null) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const { isLoading, data } = useExec("/usr/local/bin/brew", ["list", "--versions"]);

  useEffect(() => {
    if (isLoading || !data || !currentPhpVersion) {
      return undefined;
    }

    const phpPackages = data
        .split("\n")
        .filter((entry) => phpPackageRegex.test(entry))
        .reduce((acc, entry) => {
            const version = packageFromString(entry, currentPhpVersion);
            if (version) {
                acc.push(version)
            }
            return acc;
        }, [] as Package[])
        .sort((a, b) => {
            if (a.major === b.major) {
                return a.minor - b.minor;
            }
            return a.major - b.major;
        });
    setPackages(phpPackages);
  }, [isLoading, data, currentPhpVersion]);

  return {packages, isLoading} as const;
}