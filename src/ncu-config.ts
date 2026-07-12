import type { RcOptions } from "npm-check-updates";

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

/** Parsed options from one of the bundled NCU configuration files. */
export type NcuConfig = Readonly<RcOptions>;

/** Supported shared NCU preset variants. */
export type NcuConfigMode = "standard" | "workspaces";

interface NcuConfigRecord {
    readonly workspaces?: boolean;
}

/** File name of the standard single-package preset. */
export const ncuConfigFileName = ".ncurc.json" as const;

/** File name of the npm-workspaces preset. */
export const ncuWorkspacesConfigFileName = ".ncurc.workspaces.json" as const;

/** Absolute path to the bundled standard single-package preset. */
export const ncuConfigPath: string = fileURLToPath(
    new URL(`../${ncuConfigFileName}`, import.meta.url)
);

/** Absolute path to the bundled npm-workspaces preset. */
export const ncuWorkspacesConfigPath: string = fileURLToPath(
    new URL(`../${ncuWorkspacesConfigFileName}`, import.meta.url)
);

const isRecord = (value: unknown): value is NcuConfigRecord =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/** Load and validate one of the bundled NCU presets. */
export async function loadNcuConfig(
    mode: NcuConfigMode = "standard"
): Promise<NcuConfig> {
    const configPath =
        mode === "workspaces" ? ncuWorkspacesConfigPath : ncuConfigPath;
    const parsedConfig: unknown = JSON.parse(
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- selected from package-owned config path constants
        await readFile(configPath, "utf8")
    );

    return parseNcuConfig(parsedConfig, mode);
}

/**
 * Validate a bundled NCU configuration object and its workspace mode.
 *
 * @throws TypeError When the input is not an object or selects the wrong mode.
 */
export function parseNcuConfig(
    config: unknown,
    mode: NcuConfigMode
): NcuConfig {
    if (!isRecord(config)) {
        throw new TypeError("Expected the NCU config to be an object.");
    }

    const isWorkspaceMode = mode === "workspaces";

    if (config.workspaces !== isWorkspaceMode) {
        throw new TypeError(
            `Expected the ${mode} NCU config to set "workspaces" to ${String(isWorkspaceMode)}.`
        );
    }

    return config;
}
