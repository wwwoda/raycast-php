import { useExec } from "@raycast/utils";
import { useEffect, useState } from "react";
import { Version } from "./types";
import { phpVersionRegex, versionFromString } from "./util";

export default () => {
  const [version, setVersion] = useState<Version | null>(null);
  const { isLoading, data } = useExec("/usr/local/bin/php", ["-v"]);

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

  return version;
}