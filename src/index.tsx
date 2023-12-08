import { Action, ActionPanel, Toast, showToast, popToRoot, List } from "@raycast/api";
import { useState } from "react";
import useCurrentPhpVersion from "./useCurrentPhpVersion";
import useBrewPhpPackages, {cache} from "./useBrewPhpPackages";
import { Package } from "./types";
import linkPackage from "./linkPackage";
import getCurrentPhpVersion from "./getCurrentPhpVersion";

function Wrap({children}: {children: React.ReactNode}) {
  return (
    <List navigationTitle="Link PHP Version" searchBarPlaceholder="Link PHP Version">
      {children}
    </List>
  )
}

export default function Command() {
  const {version: currentPhpVersion, matchesVersion} = useCurrentPhpVersion();
  const {packages, isLoading} = useBrewPhpPackages();
  const [linkingInProgress, setLinkingInProgress] = useState(false);
  const [linkedPackage, setLinkedPackage] = useState<Package | null>(null);

  const handleAction = (pkg: Package) => {
    showToast({
      title: `Linking PHP ${pkg.simpleVersion}`,
      style: Toast.Style.Animated,
    });
    setLinkingInProgress(true);
    setLinkedPackage(pkg);
    linkPackage(pkg, packages, async () => {
      const newVersion = await getCurrentPhpVersion();
      showToast({
        title: `Running PHP ${newVersion?.version}`,
        style: Toast.Style.Success,
      }).then(() => {
        popToRoot();
      });
    });
  }

  const getEmptyView = (message: string) => (
    <List.EmptyView
      title={message}
      icon={{ source: "icon-small.png" }}
    />
  );

  if (isLoading || !currentPhpVersion) {
    return (<Wrap>{getEmptyView("Loading linkable PHP versions...")}</Wrap>)
  }

  if (linkingInProgress && linkedPackage) {
    return (<Wrap>{getEmptyView(`Linking PHP ${linkedPackage.simpleVersion}`)}</Wrap>)
  }

  if (packages.length < 2) {
    return (<Wrap>{getEmptyView("No unlinked PHP packages found")}</Wrap>)
  }

  return (
    <Wrap>
      {packages
        // .filter()
        .map((pkg) => (
          <List.Item
            key={pkg.packageName}
            title={pkg.simpleVersion}
            subtitle={matchesVersion(pkg) ? 'Active' : ''}
            actions={
              <ActionPanel>
                <Action
                  title="Link"
                  onAction={() => !matchesVersion(pkg) && handleAction(pkg)}
                />
                <Action
                  title="Clear PHP Version Cache"
                  onAction={() => cache.clear()}
                />
              </ActionPanel>
            }
          />
        ))}
    </Wrap>
  );
}
