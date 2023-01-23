import {
    Action,
    ActionPanel,
    Clipboard,
    Toast,
    showToast,
    popToRoot,
    List,
} from '@raycast/api';
import { exec } from 'child_process';
import { useMemo, useState } from 'react';
import { useExec } from "@raycast/utils";

interface Version {
    name: string;
    value: string;
}

const phpRegex = new RegExp('^(php[\\s@])');
const versionRegex = new RegExp('^(\\d+\\.\\d+)');

const handleError = async (message: string) => {
    await Clipboard.copy(message);
    void showToast({
        title: 'Error',
        message: 'Message copied to your clipboard',
        style: Toast.Style.Failure,
    });
    return;
}

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
    const command = commands.join(' && ');
    exec(command, (error, _stdout, stderr) => {
        if (error) {
            return handleError(error.message);
        }
        if (stderr) {
            return handleError(stderr);
        }
        showToast({
            title: `Successfully linked PHP ${version.name}`,
            style: Toast.Style.Success,
        }).then(() => {
            popToRoot();
        });;
    });
}

export default function Command() {
    const { isLoading, data } = useExec('/usr/local/bin/brew', ['list', '--versions']);
    const [linkingInProgress, setLinkingInProgress] = useState(false);
    const [linkedVersion, setLinkedVersion] = useState('');

    const versions: Version[] = useMemo(() => {
        if (isLoading) {
            return [];
        }
        const newVersions: Version[] = [];
        const entries = (data || '').split('\n');
        entries.forEach((entry) => {
            if (!phpRegex.test(entry)) {
                return;
            }
            const [name, version] = entry.split(' ');
            const simpleVersion = versionRegex.exec(version);
            if (!simpleVersion) {
                return;
            }
            newVersions.push({ name: simpleVersion[0], value: name });
        });
        return newVersions;
    }, [data, isLoading]);

    return <List
        navigationTitle="Link PHP Version"
        searchBarPlaceholder="Link PHP Version"
    >
        {linkingInProgress || versions.length === 0 ? (
            <List.EmptyView
                title={linkingInProgress ? `Linking PHP ${linkedVersion}` : 'Loading...'}
                icon={{ source: "icon-small.png" }}
            />
        ) : (
            versions.map((version) => (
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
                                    versions.reduce(
                                        (acc, v) => {
                                            if (v.value !== version.value) {
                                                acc.push(v.value);
                                            }
                                            return acc;
                                        },
                                        [] as string[]
                                    )
                                )
                            }} />
                    </ActionPanel>
                    }
                />
            ))
        )}
    </List>
}