import { useExec } from "@raycast/utils";
import { useCallback, useEffect, useState } from "react";
import { Package, Version } from "./types";
import { phpVersionRegex, versionFromString, versionsMatch } from "./util";
import { getPhpCommand } from "./commands";

export default () => {
  const [version, setVersion] = useState<Version | null>(null);
  const { isLoading, data } = useExec(getPhpCommand(), ["-v"]);

  useEffect(() => {
    if (isLoading || !data) {
      return undefined;
    }

    const phpVersion = phpVersionRegex.exec(data);
    if (!phpVersion || !phpVersion[1]) {
      return undefined;
    }

    const version = versionFromString(phpVersion[1]);
    if (!version) {
      return undefined;
    }

    setVersion(version);
  }, [isLoading, data]);

  const matchesVersion = useCallback(
    (obj: Version | Package) => {
      if (!version) {
        return false;
      }
      return versionsMatch(version, obj);
    },
    [version]
  );

  return { version, matchesVersion } as const;
};
