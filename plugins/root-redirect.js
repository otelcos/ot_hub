/**
 * Custom plugin to redirect root (/) to baseUrl when using subdirectory deployment
 * Not active when baseUrl is '/' (custom domain deployment)
 * Works in both development and production
 */
const path = require('path');
const fs = require('fs');

module.exports = function rootRedirectPlugin(context, options) {
  return {
    name: 'root-redirect-plugin',

    // Add middleware for development server (only active when baseUrl !== '/')
    configureWebpack(config, isServer, utils) {
      const { baseUrl } = context.siteConfig;
      // Skip if baseUrl is root (custom domain deployment)
      if (baseUrl === '/') {
        return {};
      }
      return {
        devServer: {
          setupMiddlewares: (middlewares, devServer) => {
            // Add redirect middleware at the beginning
            devServer.app.get('/', (req, res, next) => {
              // Only redirect exact root path
              if (req.path === '/') {
                res.redirect(301, baseUrl);
              } else {
                next();
              }
            });
            return middlewares;
          },
        },
      };
    },

    // Copy redirect HTML to build root for production
    async postBuild({ outDir, baseUrl }) {
      const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=${baseUrl}">
  <title>Redirecting to Open Telco...</title>
  <script>window.location.href = '${baseUrl}';</script>
</head>
<body>
  <p>Redirecting to <a href="${baseUrl}">Open Telco Hub</a>...</p>
</body>
</html>`;

      // Write redirect to parent of outDir (for subdirectory deployments)
      // So the redirect goes to build/index.html
      const parentDir = path.dirname(outDir);
      const redirectPath = path.join(parentDir, 'index.html');

      // Only write if we're in a subdirectory (baseUrl !== '/')
      if (baseUrl !== '/') {
        fs.writeFileSync(redirectPath, redirectHtml);
        console.log(`[root-redirect] Created redirect at ${redirectPath}`);
      }
    },
  };
};
