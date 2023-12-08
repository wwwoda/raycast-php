import { Toast, showToast } from "@raycast/api";
import { Package, Version } from "./types";

// Checks if brew package is any php version ("php *" or "php@*")
export const phpPackageRegex = new RegExp("^(php[\\s@])");

// Extracts major, minor and patch version from version string
export const versionRegex = new RegExp("^(?<major>\\d+)\\.?(?<minor>\\d+)?\\.?(?<patch>\\d+)?");

// Extract php version from php -v output
export const phpVersionRegex = new RegExp("PHP (\\d+[^\\s]+)");

export const handleError = async (error: Error, title = 'Something went wrong') => {
    return showToast({
        title,
        message: error.message,
        style: Toast.Style.Failure,
    });
};

export const packageFromString = (pkg: string) => {
  const [packageName, ...packageVersions] = pkg.split(" ");
  const latestVersion = packageVersions[packageVersions.length - 1];

  const version = versionFromString(latestVersion);
  if (!version) {
    return null;
  }

  return {
    packageName,
    ...version,
  } as Package;
}

export const versionFromString = (version: string): Version | null => {
  const versionArray = versionRegex.exec(version);
  if (!versionArray?.groups?.major || !versionArray?.groups?.minor) {
    return null;
  }
  const major = parseInt(versionArray.groups.major);
  const minor = parseInt(versionArray.groups.minor);
  const str = `${major}.${minor}`;
  return {
    version,
    simpleVersion: str,
    major,
    minor,
  };
}

export const versionsMatch = (v1: Version | Package, v2: Version | Package) =>
  v1.major === v2.major && v1.minor === v2.minor;
