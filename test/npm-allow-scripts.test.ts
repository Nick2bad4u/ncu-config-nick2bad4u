import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

interface LockfilePackage {
    readonly hasInstallScript?: boolean;
    readonly version?: string;
}

interface PackageLock {
    readonly packages?: Readonly<Record<string, LockfilePackage>>;
}

interface PackageManifest {
    readonly allowScripts?: Readonly<Record<string, boolean>>;
    readonly scripts?: Readonly<Record<string, string>>;
}

const readJson = async (fileName: string): Promise<unknown> =>
    JSON.parse(
        await readFile(new URL(`../${fileName}`, import.meta.url), "utf8")
    );

const getPackageName = (packagePath: string): string => {
    const nodeModulesMarker = "node_modules/";
    const packageName = packagePath.slice(
        packagePath.lastIndexOf(nodeModulesMarker) + nodeModulesMarker.length
    );

    if (packageName.length === 0) {
        throw new TypeError(
            `Cannot determine package name from ${packagePath}.`
        );
    }

    return packageName;
};

describe("npm lifecycle-script policy", () => {
    it("runs full dependency updates without force or legacy script flags", async () => {
        expect.assertions(3);

        const manifest = (await readJson("package.json")) as PackageManifest;
        const updateScript = manifest.scripts?.["update-deps"];

        expect(updateScript).toContain("npm update --all");
        expect(updateScript).not.toContain("--force");
        expect(updateScript).not.toContain("--allow-scripts");
    });

    it("reviews every install script recorded in the lockfile", async () => {
        expect.assertions(3);

        const manifest = (await readJson("package.json")) as PackageManifest;
        const lockfile = (await readJson("package-lock.json")) as PackageLock;
        const installScriptPackages = Object.entries(lockfile.packages ?? {})
            .filter(
                ([, packageMetadata]) =>
                    packageMetadata.hasInstallScript === true
            )
            .map(([packagePath, packageMetadata]) => {
                if (packageMetadata.version === undefined) {
                    throw new TypeError(
                        `Missing version for install-script package ${packagePath}.`
                    );
                }

                return `${getPackageName(packagePath)}@${packageMetadata.version}`;
            })
            .toSorted((first, second) => first.localeCompare(second));

        expect(manifest.allowScripts).toStrictEqual({
            "core-js@3.49.0": false,
            "esbuild@0.28.1": true,
            "fsevents@2.3.3": true,
            "unrs-resolver@1.12.2": true,
        });
        expect(manifest.allowScripts).not.toHaveProperty("esbuild@0.27.7");
        expect(
            Object.keys(manifest.allowScripts ?? {}).toSorted((first, second) =>
                first.localeCompare(second)
            )
        ).toStrictEqual(installScriptPackages);
    });
});
