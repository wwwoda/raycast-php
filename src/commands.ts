import { getPreferenceValues } from "@raycast/api";

export const getBrewCommand = () => getPreferenceValues().brewPath || "/opt/homebrew/bin/brew";

export const getPhpCommand = () => {
  const arr = getBrewCommand().split("/").slice(0, -1);
  arr.push("php");
  return arr.join("/");
};
