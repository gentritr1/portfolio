import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), [
    "VITE_SITE_URL",
    "VERCEL_PROJECT_PRODUCTION_URL",
    "VITE_VERCEL_PROJECT_PRODUCTION_URL",
  ]);
  const productionHost =
    env.VERCEL_PROJECT_PRODUCTION_URL || env.VITE_VERCEL_PROJECT_PRODUCTION_URL;
  const site =
    env.VITE_SITE_URL || (productionHost ? `https://${productionHost}` : "");
  let imageUrl = "/og-image.png";
  if (site) {
    const url = new URL(site);
    if (url.protocol !== "https:" && url.protocol !== "http:")
      throw new Error("VITE_SITE_URL must be an HTTP(S) URL.");
    imageUrl = new URL("/og-image.png", url.origin).href;
  }

  return {
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            // Keep the already-eager framework stable as more lazy drafts are added.
            groups: [
              {
                name: "react-vendor",
                test: /[\\/]node_modules[\\/](?:react|react-dom|react-router|scheduler)[\\/]/,
                tags: ["$initial"],
              },
            ],
          },
        },
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "portfolio-social-image",
        transformIndexHtml(html) {
          return html.replaceAll(
            'content="/og-image.png"',
            `content="${imageUrl}"`,
          );
        },
      },
    ],
  };
});
