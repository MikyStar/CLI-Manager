const { build } = require("esbuild");

////////////////////////////////////////

(async () => {
  build({
    entryPoints: ["src/Main.ts"],
    bundle: true,
    minify: true,
    platform: "node",
    target: "node18",
    outfile: "bin/cli.js",
    banner: {
      js: "#!/usr/bin/env node",
    },
  })
})();
