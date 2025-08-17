@@ .. @@
+
+## Deployment Configuration
+
+This project includes configuration files for various hosting platforms to ensure proper routing for the single-page application:
+
+### Netlify
+- Uses `public/_redirects` and `netlify.toml` files
+- Automatically handles client-side routing
+
+### Vercel
+- Uses `vercel.json` configuration
+- Rewrites all routes to `index.html`
+
+### GitHub Pages
+- Uses `public/404.html` for client-side routing
+- Includes script in `index.html` to handle redirects
+
+### Apache Servers
+- Uses `public/.htaccess` file
+- Enables URL rewriting for SPA routing
+
+### Other Static Hosts
+- Most platforms support the `_redirects` file format
+- Fallback to serving `index.html` for all routes
+
+## Usage
+
+### Live Mode
+```
+https://your-domain.com/live/VIDEO_URL
+```
+
+### Recorded Mode
+```
+https://your-domain.com/rec/VIDEO_URL
+```
+
+Where `VIDEO_URL` is the double-encoded URL of your video (YouTube, MP4, or M3U8).
+
+### Example URLs
+```
+# YouTube video
+https://your-domain.com/live/https%253A%252F%252Fwww.youtube.com%252Fwatch%253Fv%253DdQw4w9WgXcQ
+
+# MP4 video
+https://your-domain.com/rec/https%253A%252F%252Fexample.com%252Fvideo.mp4
+```