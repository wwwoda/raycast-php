import { Cache } from "@raycast/api";
import { useExec } from "@raycast/utils";
import { useEffect, useState } from "react";
import { Package } from "./types";
import { packageFromString, phpPackageRegex } from "./util";
import { getBrewCommand } from "./commands";

export const cache = new Cache();
const cached = cache.get("phpPackages");

export default () => {
  const [packages, setPackages] = useState<Package[]>(cached ? JSON.parse(cached) : []);
  const { isLoading, data } = useExec(getBrewCommand(), ["list", "--versions"]);

  useEffect(() => {
    if (isLoading || !data) {
      return undefined;
    }

    const phpPackages = data
      .split("\n")
      .filter((entry) => phpPackageRegex.test(entry))
      .reduce((acc, entry) => {
        const version = packageFromString(entry);
        if (version) {
          acc.push(version);
        }
        return acc;
      }, [] as Package[])
      .sort((a, b) => {
        if (a.major === b.major) {
          return b.minor - a.minor;
        }
        return b.major - a.major;
      });

    setPackages(phpPackages);

    cache.set("phpPackages", JSON.stringify(phpPackages));
  }, [isLoading, data]);

  return { packages, isLoading: !packages.length && isLoading } as const;
};
