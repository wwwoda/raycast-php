import { Action, ActionPanel, Clipboard, Toast, showToast, popToRoot, List } from "@raycast/api";
import { exec } from "child_process";
import { useMemo, useState } from "react";
import { useExec } from "@raycast/utils";

interface Version {
  name: string;
  value: string;
  current: boolean;
}

const phpRegex = new RegExp("^(php[\\s@])");
const versionRegex = new RegExp("^(\\d+\\.\\d+)");
const phpVerifyRegex = new RegExp("^PHP (\\d+[^\\s]+)");

const handleError = async (message: string) => {
  await Clipboard.copy(message);
  return showToast({
    title: "Error",
    message: "Message copied to your clipboard",
    style: Toast.Style.Failure,
  });
};

const linkVersion = (version: Version, unlinkVersions: string[]) => {
  showToast({
    title: `Linking PHP ${version.name}`,
    style: Toast.Style.Animated,
  });

  const commands: string[] = [];

  unlinkVersions.forEach((v) => {
    commands.push(`brew unlink ${v}`);
  });

  commands.push(`brew link ${version.value}`);

  exec(commands.join(" && "), (error, _stdout, stderr) => {
    if (error) {
      return handleError(error.message);
    }

    if (stderr) {
      return handleError(stderr);
    }

    verifyVersion(version.name);
  });
};

const verifyVersion = (checkVersion: string) => {
  exec("php -v", (error, stdout, stderr) => {
    if (error) {
      return handleError(error.message);
    }

    if (stderr) {
      return handleError(stderr);
    }

    const version = phpVerifyRegex.exec(stdout);

    if (!version) {
      return handleError("Could not verify version");
    }

    if (!version[1].startsWith(checkVersion)) {
      return handleError(`Could not verify version. Expected ${checkVersion} but got ${version[1]}`);
    }

    showToast({
      title: `Running PHP ${version[1]}`,
      style: Toast.Style.Success,
    }).then(() => {
      popToRoot();
    });
  });
};

export default function Command() {
  const { isLoading: isLoadingPhpVersion, data: phpVersionString } = useExec("/usr/local/bin/php", ["-v"]);
  const { isLoading, data } = useExec("/usr/local/bin/brew", ["list", "--versions"]);

  const [linkingInProgress, setLinkingInProgress] = useState(false);
  const [linkedVersion, setLinkedVersion] = useState("");

  const currentPhpVersion = useMemo(() => {
    if (isLoadingPhpVersion || !phpVersionString) {
      return "";
    }
    const version = phpVerifyRegex.exec(phpVersionString);
    if (!version) {
      return "";
    }
    const simpleVersion = versionRegex.exec(version[1]);
    if (!simpleVersion) {
      return "";
    }
    return simpleVersion[1];
  }, [phpVersionString, isLoadingPhpVersion]);

  const versions = useMemo(() => {
    if (isLoading) {
      return [];
    }
    const entries = (data || "").split("\n");
    return entries
      .filter((entry) => phpRegex.test(entry))
      .map((entry) => {
        const [name, version] = entry.split(" ");
        const simpleVersion = versionRegex.exec(version);
        if (!simpleVersion) {
          return;
        }
        return {
          name: simpleVersion[1],
          value: name,
          current: simpleVersion[1] === currentPhpVersion,
        } as Version;
      })
      .filter((v) => v)
      .sort((a, b) => parseFloat(b!.name) - parseFloat(a!.name)) as Version[];
  }, [data, isLoading, currentPhpVersion]);

  return (
    <List navigationTitle="Link PHP Version" searchBarPlaceholder="Link PHP Version">
      {linkingInProgress || versions.length === 0 ? (
        <List.EmptyView
          title={linkingInProgress ? `Linking PHP ${linkedVersion}` : "Loading..."}
          icon={{ source: "icon-small.png" }}
        />
      ) : (
        versions
          .filter((v) => !v.current)
          .map((version) => (
            <List.Item
              key={version.value}
              title={version.name}
              actions={
                <ActionPanel>
                  <Action
                    title="Link"
                    onAction={() => {
                      setLinkingInProgress(true);
                      setLinkedVersion(version.name);
                      linkVersion(
                        version,
                        versions.reduce((acc, v) => {
                          if (v.value !== version.value) {
                            acc.push(v.value);
                          }
                          return acc;
                        }, [] as string[])
                      );
                    }}
                  />
                </ActionPanel>
              }
            />
          ))
      )}
    </List>
  );
}
