/**
 * Custom plugin to redirect root (/) to baseUrl (/ot_hub/)
 * Works in both development and production
 */
const path = require('path');
const fs = require('fs');

module.exports = function rootRedirectPlugin(context, options) {
  return {
    name: 'root-redirect-plugin',

    // Add middleware for development server
    configureWebpack(config, isServer, utils) {
      return {
        devServer: {
          setupMiddlewares: (middlewares, devServer) => {
            // Add redirect middleware at the beginning
            devServer.app.get('/', (req, res, next) => {
              // Only redirect exact root path
              if (req.path === '/') {
                res.redirect(301, '/ot_hub/');
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

      // Write redirect to parent of outDir (which is build/ot_hub)
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
