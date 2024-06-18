import { defineConfig } from "vite";


export default defineConfig({
    root: "client",
    base: "/assets",
    build: {
        target: "esnext",
        outDir: "../dist/client",
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
                assetFileNames: "[name].[ext]",
                sourcemapFileNames: "[name].js.map",
            },
        }
    }
});