/** @type {import('jest').Config} */

export default {
    testEnvironment: "node",

    extensionsToTreatAsEsm: [".ts"],

    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                useESM: true,
                tsconfig: "tsconfig.json",
            },
        ],
    },

    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },

    testMatch: ["**/*.spec.ts"],
};
