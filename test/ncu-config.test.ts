import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
    loadNcuConfig,
    ncuConfigFileName,
    ncuConfigPath,
    ncuWorkspacesConfigFileName,
    ncuWorkspacesConfigPath,
    parseNcuConfig,
} from "../src/ncu-config.js";

const packageRoot = fileURLToPath(new URL("..", import.meta.url)),
    ncuCliPath = path.join(
        packageRoot,
        "node_modules",
        "npm-check-updates",
        "build",
        "cli.js"
    );

const writeJson = async (filePath: string, value: unknown): Promise<void> => {
    await writeFile(
        filePath,
        `${JSON.stringify(value, undefined, 4)}\n`,
        "utf8"
    );
};

const createConsumer = async (): Promise<string> => {
    const consumerRoot = await mkdtemp(path.join(tmpdir(), "ncu-config-test-"));
    const installedConfigRoot = path.join(
        consumerRoot,
        "node_modules",
        "ncu-config-nick2bad4u"
    );

    await mkdir(installedConfigRoot, { recursive: true });
    await cp(ncuConfigPath, path.join(installedConfigRoot, ncuConfigFileName));
    await cp(
        ncuWorkspacesConfigPath,
        path.join(installedConfigRoot, ncuWorkspacesConfigFileName)
    );

    return consumerRoot;
};

const runNcu = (consumerRoot: string, configFileName: string): unknown => {
    const configFilePath = path.join(
        consumerRoot,
        "node_modules",
        "ncu-config-nick2bad4u"
    );
    const stdout = execFileSync(
        process.execPath,
        [
            ncuCliPath,
            "--configFileName",
            configFileName,
            "--configFilePath",
            configFilePath,
            "--registryType",
            "json",
            "--registry",
            path.join(consumerRoot, "registry.json"),
            "--format",
            "group,dep",
            "--no-interactive",
            "--no-upgrade",
            "--jsonUpgraded",
            "--no-color",
        ],
        {
            cwd: consumerRoot,
            encoding: "utf8",
            windowsHide: true,
        }
    );
    return JSON.parse(stdout) as unknown;
};

describe("ncu shared configs", () => {
    it("loads both presets with shared policy and intended workspace modes", async () => {
        expect.assertions(12);

        const standardConfig = await loadNcuConfig();
        const workspaceConfig = await loadNcuConfig("workspaces");
        const { root: workspaceRoot, ...workspaceSharedConfig } =
            workspaceConfig;

        expect(path.isAbsolute(ncuConfigPath)).toBe(true);
        expect(path.isAbsolute(ncuWorkspacesConfigPath)).toBe(true);
        expect(standardConfig.workspaces).toBe(false);
        expect(workspaceConfig.workspaces).toBe(true);
        expect(workspaceRoot).toBe(true);
        expect(workspaceSharedConfig).toStrictEqual({
            ...standardConfig,
            workspaces: true,
        });
        expect(standardConfig.deep).toBe(false);
        expect(standardConfig.install).toBe("never");
        expect(standardConfig.reject).toStrictEqual(["typescript"]);
        expect(standardConfig.upgrade).toBe(true);
        expect(standardConfig).not.toHaveProperty("configFileName");
        expect(workspaceConfig).not.toHaveProperty("configFilePath");
    });

    it("rejects invalid input and mismatched workspace modes", () => {
        expect.assertions(2);

        expect(() => parseNcuConfig([], "standard")).toThrow(TypeError);
        expect(() =>
            parseNcuConfig({ workspaces: false }, "workspaces")
        ).toThrow(/workspaces/v);
    });

    it("runs the standard preset from a simulated node_modules install", async () => {
        expect.assertions(2);

        const consumerRoot = await createConsumer();
        const packagePath = path.join(consumerRoot, "package.json");

        try {
            await writeJson(packagePath, {
                dependencies: {
                    "fixture-package": "1.0.0",
                    typescript: "6.0.3",
                },
                name: "ncu-standard-consumer",
                private: true,
            });
            await writeJson(path.join(consumerRoot, "registry.json"), {
                "fixture-package": "2.0.0",
                typescript: "7.0.0",
            });

            const upgraded = runNcu(consumerRoot, ncuConfigFileName);

            expect(upgraded).toStrictEqual({ "fixture-package": "2.0.0" });
            expect(
                JSON.parse(await readFile(packagePath, "utf8"))
            ).toHaveProperty("dependencies.fixture-package", "1.0.0");
        } finally {
            await rm(consumerRoot, { force: true, recursive: true });
        }
    });

    it("runs the workspace preset across root and workspace manifests", async () => {
        expect.assertions(3);

        const consumerRoot = await createConsumer();
        const workspaceRoot = path.join(consumerRoot, "packages", "fixture");

        try {
            await mkdir(workspaceRoot, { recursive: true });
            await writeJson(path.join(consumerRoot, "package.json"), {
                dependencies: {
                    "root-package": "1.0.0",
                    typescript: "6.0.3",
                },
                name: "ncu-workspace-consumer",
                private: true,
                workspaces: ["packages/*"],
            });
            await writeJson(path.join(workspaceRoot, "package.json"), {
                dependencies: { "workspace-package": "1.0.0" },
                name: "ncu-workspace-fixture",
                private: true,
                version: "1.0.0",
            });
            await writeJson(path.join(consumerRoot, "registry.json"), {
                "root-package": "2.0.0",
                typescript: "7.0.0",
                "workspace-package": "3.0.0",
            });

            const upgraded = runNcu(consumerRoot, ncuWorkspacesConfigFileName);

            expect(upgraded).toHaveProperty(
                ["package.json", "root-package"],
                "2.0.0"
            );
            expect(upgraded).toHaveProperty(
                ["packages/fixture/package.json", "workspace-package"],
                "3.0.0"
            );
            expect(upgraded).not.toHaveProperty(["package.json", "typescript"]);
        } finally {
            await rm(consumerRoot, { force: true, recursive: true });
        }
    });
});
