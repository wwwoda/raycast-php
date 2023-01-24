export type Version = {
  version: string;
  simpleVersion: string;
  major: number;
  minor: number;}

export type Package = {
  packageName: string;
} & Version;