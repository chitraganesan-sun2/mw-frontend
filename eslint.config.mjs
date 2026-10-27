import coreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
    ...coreWebVitals,
    {
        rules: {
            "no-console": ["warn", { allow: ["warn", "error"] }],
            // New React Compiler-era rules from eslint-plugin-react-hooks 6: existing code predates
            // them, so they report as a warning backlog rather than failing lint.
            "react-hooks/set-state-in-effect": "warn",
            "react-hooks/static-components": "warn",
            "react-hooks/refs": "warn",
            "react-hooks/immutability": "warn",
        },
    },
    { ignores: [".next/**", "out/**", "android/**", "node_modules/**", "public/**"] },
];

export default config;
