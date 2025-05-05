// vite.config.ts
import process4 from "node:process";
import { URL, fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "file:///D:/desktop/newProject/client/node_modules/.pnpm/vite@5.4.11_@types+node@22.9.0_sass@1.83.0_terser@5.36.0/node_modules/vite/dist/node/index.js";

// build/plugins/index.ts
import vue from "file:///D:/desktop/newProject/client/node_modules/.pnpm/@vitejs+plugin-vue@5.2.0_vi_34d2f8a68a7df03c31722b9e97cfb5e6/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///D:/desktop/newProject/client/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.1._d100a6098eb57c110356613595a1d958/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import VueDevtools from "file:///D:/desktop/newProject/client/node_modules/.pnpm/vite-plugin-vue-devtools@7._a4413b1cf12a4eb32878a3e530f2d581/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
import progress from "file:///D:/desktop/newProject/client/node_modules/.pnpm/vite-plugin-progress@0.0.7__61e186982b7c4633c077fe84ec2b0771/node_modules/vite-plugin-progress/dist/index.mjs";

// build/plugins/router.ts
import ElegantVueRouter from "file:///D:/desktop/newProject/client/node_modules/.pnpm/@elegant-router+vue@0.3.8/node_modules/@elegant-router/vue/dist/vite.mjs";
function setupElegantRouter() {
  return ElegantVueRouter({
    layouts: {
      base: "src/layouts/base-layout/index.vue",
      blank: "src/layouts/blank-layout/index.vue",
      bg: "src/layouts/bg-layout/index.vue"
    },
    customRoutes: {
      names: [
        "exception_403",
        "exception_404",
        "exception_500",
        "document_project",
        "document_project-link"
      ]
    },
    routePathTransformer(routeName, routePath) {
      const key = routeName;
      if (key === "login") {
        const modules = ["pwd-login", "code-login", "register", "reset-pwd", "bind-wechat"];
        const moduleReg = modules.join("|");
        return `/login/:module(${moduleReg})?`;
      }
      return routePath;
    },
    onRouteMetaGen(routeName) {
      const key = routeName;
      const constantRoutes = ["login", "403", "404", "500"];
      const meta = {
        title: key,
        i18nKey: `route.${key}`
      };
      if (constantRoutes.includes(key)) {
        meta.constant = true;
      }
      return meta;
    }
  });
}

// build/plugins/unocss.ts
import process from "node:process";
import path from "node:path";
import unocss from "file:///D:/desktop/newProject/client/node_modules/.pnpm/@unocss+vite@0.64.1_rollup@_ec3d45a5927819a602c7c956dfd82116/node_modules/@unocss/vite/dist/index.mjs";
import presetIcons from "file:///D:/desktop/newProject/client/node_modules/.pnpm/@unocss+preset-icons@0.64.1/node_modules/@unocss/preset-icons/dist/index.mjs";
import { FileSystemIconLoader } from "file:///D:/desktop/newProject/client/node_modules/.pnpm/@iconify+utils@2.1.33/node_modules/@iconify/utils/lib/loader/node-loaders.mjs";
function setupUnocss(viteEnv) {
  const { VITE_ICON_PREFIX, VITE_ICON_LOCAL_PREFIX } = viteEnv;
  const localIconPath = path.join(process.cwd(), "src/assets/svg-icon");
  const collectionName = VITE_ICON_LOCAL_PREFIX.replace(`${VITE_ICON_PREFIX}-`, "");
  return unocss({
    presets: [
      presetIcons({
        prefix: `${VITE_ICON_PREFIX}-`,
        scale: 1,
        extraProperties: {
          display: "inline-block"
        },
        collections: {
          [collectionName]: FileSystemIconLoader(
            localIconPath,
            (svg) => svg.replace(/^<svg\s/, '<svg width="1em" height="1em" ')
          )
        },
        warn: true
      })
    ]
  });
}

// build/plugins/unplugin.ts
import process2 from "node:process";
import path2 from "node:path";
import Icons from "file:///D:/desktop/newProject/client/node_modules/.pnpm/unplugin-icons@0.20.1_@vue+_5b52996a5a80768666b6f259c9c3ac48/node_modules/unplugin-icons/dist/vite.js";
import IconsResolver from "file:///D:/desktop/newProject/client/node_modules/.pnpm/unplugin-icons@0.20.1_@vue+_5b52996a5a80768666b6f259c9c3ac48/node_modules/unplugin-icons/dist/resolver.js";
import Components from "file:///D:/desktop/newProject/client/node_modules/.pnpm/unplugin-vue-components@0.2_3001cfea8ff62d177c36e0ec5c35e650/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///D:/desktop/newProject/client/node_modules/.pnpm/unplugin-vue-components@0.2_3001cfea8ff62d177c36e0ec5c35e650/node_modules/unplugin-vue-components/dist/resolvers.js";
import { FileSystemIconLoader as FileSystemIconLoader2 } from "file:///D:/desktop/newProject/client/node_modules/.pnpm/unplugin-icons@0.20.1_@vue+_5b52996a5a80768666b6f259c9c3ac48/node_modules/unplugin-icons/dist/loaders.js";
import { createSvgIconsPlugin } from "file:///D:/desktop/newProject/client/node_modules/.pnpm/vite-plugin-svg-icons@2.0.1_bdae9485e92924f1ed410772aff3fd42/node_modules/vite-plugin-svg-icons/dist/index.mjs";
function setupUnplugin(viteEnv) {
  const { VITE_ICON_PREFIX, VITE_ICON_LOCAL_PREFIX } = viteEnv;
  const localIconPath = path2.join(process2.cwd(), "src/assets/svg-icon");
  const collectionName = VITE_ICON_LOCAL_PREFIX.replace(`${VITE_ICON_PREFIX}-`, "");
  const plugins = [
    Icons({
      compiler: "vue3",
      customCollections: {
        [collectionName]: FileSystemIconLoader2(
          localIconPath,
          (svg) => svg.replace(/^<svg\s/, '<svg width="1em" height="1em" ')
        )
      },
      scale: 1,
      defaultClass: "inline-block"
    }),
    Components({
      dts: "src/typings/components.d.ts",
      types: [{ from: "vue-router", names: ["RouterLink", "RouterView"] }],
      resolvers: [
        // auto import Element Plus components。 full import to see /src/plugins/ui.ts
        ElementPlusResolver({
          // no to import style, full import to see /src/plugins/assets.ts
          importStyle: false
        }),
        IconsResolver({ customCollections: [collectionName], componentPrefix: VITE_ICON_PREFIX })
      ]
    }),
    createSvgIconsPlugin({
      iconDirs: [localIconPath],
      symbolId: `${VITE_ICON_LOCAL_PREFIX}-[dir]-[name]`,
      inject: "body-last",
      customDomId: "__SVG_ICON_LOCAL__"
    })
  ];
  return plugins;
}

// build/plugins/html.ts
function setupHtmlPlugin(buildTime) {
  const plugin = {
    name: "html-plugin",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace("<head>", `<head>
    <meta name="buildTime" content="${buildTime}">`);
    }
  };
  return plugin;
}

// build/plugins/index.ts
function setupVitePlugins(viteEnv, buildTime) {
  const plugins = [
    vue(),
    vueJsx(),
    VueDevtools(),
    setupElegantRouter(),
    setupUnocss(viteEnv),
    ...setupUnplugin(viteEnv),
    progress(),
    setupHtmlPlugin(buildTime)
  ];
  return plugins;
}

// src/utils/service.ts
import json5 from "file:///D:/desktop/newProject/client/node_modules/.pnpm/json5@2.2.3/node_modules/json5/lib/index.js";
function createServiceConfig(env) {
  const { VITE_SERVICE_BASE_URL, VITE_OTHER_SERVICE_BASE_URL } = env;
  let other = {};
  try {
    other = json5.parse(VITE_OTHER_SERVICE_BASE_URL);
  } catch {
    console.error("VITE_OTHER_SERVICE_BASE_URL is not a valid json5 string");
  }
  const httpConfig = {
    baseURL: VITE_SERVICE_BASE_URL,
    other
  };
  const otherHttpKeys = Object.keys(httpConfig.other);
  const otherConfig = otherHttpKeys.map((key) => {
    return {
      key,
      baseURL: httpConfig.other[key],
      proxyPattern: createProxyPattern(key)
    };
  });
  const config = {
    baseURL: httpConfig.baseURL,
    proxyPattern: createProxyPattern(),
    other: otherConfig
  };
  return config;
}
function createProxyPattern(key) {
  if (!key) {
    return "/proxy-default";
  }
  return `/proxy-${key}`;
}

// build/config/cli-helper.ts
import process3 from "node:process";
import readline from "node:readline";
function clearScreen() {
  const repeatCount = process3.stdout.rows - 2;
  const blank = repeatCount > 0 ? "\n".repeat(repeatCount) : "";
  console.log(blank);
  readline.cursorTo(process3.stdout, 0, 0);
  readline.clearScreenDown(process3.stdout);
}
function formatter(open, close, replace = open) {
  return (input) => {
    const string = `${input}`;
    const index = string.indexOf(close, open.length);
    return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close;
  };
}
function replaceClose(string, close, replace, index) {
  const start = string.substring(0, index) + replace;
  const end = string.substring(index + close.length);
  const nextIndex = end.indexOf(close);
  return ~nextIndex ? start + replaceClose(end, close, replace, nextIndex) : start + end;
}
function createColors() {
  return {
    bgBlack: formatter("\x1B[40m", "\x1B[49m"),
    bgBlue: formatter("\x1B[44m", "\x1B[49m"),
    bgCyan: formatter("\x1B[46m", "\x1B[49m"),
    bgGreen: formatter("\x1B[42m", "\x1B[49m"),
    bgMagenta: formatter("\x1B[45m", "\x1B[49m"),
    bgRed: formatter("\x1B[41m", "\x1B[49m", "\x1B[22m\x1B[1m"),
    bgWhite: formatter("\x1B[47m", "\x1B[49m"),
    bgYellow: formatter("\x1B[43m", "\x1B[49m"),
    black: formatter("\x1B[30m", "\x1B[39m"),
    blue: formatter("\x1B[34m", "\x1B[39m"),
    bold: formatter("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m"),
    cyan: formatter("\x1B[36m", "\x1B[39m"),
    dim: formatter("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"),
    gray: formatter("\x1B[90m", "\x1B[39m"),
    green: formatter("\x1B[32m", "\x1B[39m"),
    hidden: formatter("\x1B[8m", "\x1B[28m"),
    inverse: formatter("\x1B[7m", "\x1B[27m"),
    italic: formatter("\x1B[3m", "\x1B[23m"),
    magenta: formatter("\x1B[35m", "\x1B[39m"),
    red: formatter("\x1B[31m", "\x1B[39m"),
    reset: (s) => `\x1B[0m${s}\x1B[0m`,
    strikethrough: formatter("\x1B[9m", "\x1B[29m"),
    underline: formatter("\x1B[4m", "\x1B[24m"),
    white: formatter("\x1B[37m", "\x1B[39m"),
    yellow: formatter("\x1B[33m", "\x1B[39m")
  };
}

// build/config/proxy.ts
var colors = createColors();
function createViteProxy(env, enable) {
  const isEnableHttpProxy = enable && env.VITE_HTTP_PROXY === "Y";
  if (!isEnableHttpProxy) return void 0;
  const { baseURL, proxyPattern, other } = createServiceConfig(env);
  const proxy = createProxyItem({ baseURL, proxyPattern });
  other.forEach((item) => {
    Object.assign(proxy, createProxyItem(item));
  });
  return proxy;
}
function createProxyItem(item) {
  const proxy = {};
  proxy[item.proxyPattern] = {
    target: item.baseURL,
    changeOrigin: true,
    configure: (_proxy, options) => {
      _proxy.on("proxyReq", (_proxyReq, req, _res) => {
        clearScreen();
        console.log(colors.bgYellow(`  ${req.method}  `), colors.green(`${options.target}${req.url}`));
      });
      _proxy.on("error", (_err, req, _res) => {
        console.log(colors.bgRed(`Error\uFF1A${req.method}  `), colors.green(`${options.target}${req.url}`));
      });
    },
    rewrite: (path3) => path3.replace(new RegExp(`^${item.proxyPattern}`), "")
  };
  return proxy;
}

// build/config/time.ts
import dayjs from "file:///D:/desktop/newProject/client/node_modules/.pnpm/dayjs@1.11.13/node_modules/dayjs/dayjs.min.js";
import utc from "file:///D:/desktop/newProject/client/node_modules/.pnpm/dayjs@1.11.13/node_modules/dayjs/plugin/utc.js";
import timezone from "file:///D:/desktop/newProject/client/node_modules/.pnpm/dayjs@1.11.13/node_modules/dayjs/plugin/timezone.js";
function getBuildTime() {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const buildTime = dayjs.tz(Date.now(), "Asia/Shanghai").format("YYYY-MM-DD HH:mm:ss");
  return buildTime;
}

// vite.config.ts
var __vite_injected_original_import_meta_url = "file:///D:/desktop/newProject/client/vite.config.ts";
var vite_config_default = defineConfig((configEnv) => {
  const viteEnv = loadEnv(configEnv.mode, process4.cwd());
  const buildTime = getBuildTime();
  const enableProxy = configEnv.command === "serve" && !configEnv.isPreview;
  return {
    base: viteEnv.VITE_BASE_URL,
    resolve: {
      alias: {
        "~": fileURLToPath(new URL("./", __vite_injected_original_import_meta_url)),
        "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          additionalData: `@use "@/styles/scss/global.scss" as *;`
        }
      }
    },
    plugins: setupVitePlugins(viteEnv, buildTime),
    define: {
      BUILD_TIME: JSON.stringify(buildTime),
      __VUE_PROD_DEVTOOLS__: false
      // 彻底禁用生产环境 DevTools
    },
    server: {
      host: "0.0.0.0",
      port: 9527,
      open: true,
      proxy: createViteProxy(viteEnv, enableProxy)
    },
    preview: {
      port: 9725
    },
    build: {
      reportCompressedSize: false,
      sourcemap: viteEnv.VITE_SOURCE_MAP === "Y",
      commonjsOptions: {
        ignoreTryCatch: false
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiYnVpbGQvcGx1Z2lucy9pbmRleC50cyIsICJidWlsZC9wbHVnaW5zL3JvdXRlci50cyIsICJidWlsZC9wbHVnaW5zL3Vub2Nzcy50cyIsICJidWlsZC9wbHVnaW5zL3VucGx1Z2luLnRzIiwgImJ1aWxkL3BsdWdpbnMvaHRtbC50cyIsICJzcmMvdXRpbHMvc2VydmljZS50cyIsICJidWlsZC9jb25maWcvY2xpLWhlbHBlci50cyIsICJidWlsZC9jb25maWcvcHJveHkudHMiLCAiYnVpbGQvY29uZmlnL3RpbWUudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxkZXNrdG9wXFxcXG5ld1Byb2plY3RcXFxcY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxkZXNrdG9wXFxcXG5ld1Byb2plY3RcXFxcY2xpZW50XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9kZXNrdG9wL25ld1Byb2plY3QvY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHByb2Nlc3MgZnJvbSAnbm9kZTpwcm9jZXNzJztcbmltcG9ydCB7IFVSTCwgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgc2V0dXBWaXRlUGx1Z2lucyB9IGZyb20gJy4vYnVpbGQvcGx1Z2lucyc7XG5pbXBvcnQgeyBjcmVhdGVWaXRlUHJveHksIGdldEJ1aWxkVGltZSB9IGZyb20gJy4vYnVpbGQvY29uZmlnJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGNvbmZpZ0VudiA9PiB7XG4gIGNvbnN0IHZpdGVFbnYgPSBsb2FkRW52KGNvbmZpZ0Vudi5tb2RlLCBwcm9jZXNzLmN3ZCgpKSBhcyB1bmtub3duIGFzIEVudi5JbXBvcnRNZXRhO1xuXG4gIGNvbnN0IGJ1aWxkVGltZSA9IGdldEJ1aWxkVGltZSgpO1xuXG4gIGNvbnN0IGVuYWJsZVByb3h5ID0gY29uZmlnRW52LmNvbW1hbmQgPT09ICdzZXJ2ZScgJiYgIWNvbmZpZ0Vudi5pc1ByZXZpZXc7XG5cbiAgcmV0dXJuIHtcbiAgICBiYXNlOiB2aXRlRW52LlZJVEVfQkFTRV9VUkwsXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ34nOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpXG4gICAgICB9XG4gICAgfSxcbiAgICBjc3M6IHtcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgc2Nzczoge1xuICAgICAgICAgIGFwaTogJ21vZGVybi1jb21waWxlcicsXG4gICAgICAgICAgYWRkaXRpb25hbERhdGE6IGBAdXNlIFwiQC9zdHlsZXMvc2Nzcy9nbG9iYWwuc2Nzc1wiIGFzICo7YFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBwbHVnaW5zOiBzZXR1cFZpdGVQbHVnaW5zKHZpdGVFbnYsIGJ1aWxkVGltZSksXG4gICAgZGVmaW5lOiB7XG4gICAgICBCVUlMRF9USU1FOiBKU09OLnN0cmluZ2lmeShidWlsZFRpbWUpLFxuICAgICAgX19WVUVfUFJPRF9ERVZUT09MU19fOiBmYWxzZSwgLy8gXHU1RjdCXHU1RTk1XHU3OTgxXHU3NTI4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzIERldlRvb2xzXG4gICAgfSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICAgIHBvcnQ6IDk1MjcsXG4gICAgICBvcGVuOiB0cnVlLFxuICAgICAgcHJveHk6IGNyZWF0ZVZpdGVQcm94eSh2aXRlRW52LCBlbmFibGVQcm94eSlcbiAgICB9LFxuICAgIHByZXZpZXc6IHtcbiAgICAgIHBvcnQ6IDk3MjVcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogZmFsc2UsXG4gICAgICBzb3VyY2VtYXA6IHZpdGVFbnYuVklURV9TT1VSQ0VfTUFQID09PSAnWScsXG4gICAgICBjb21tb25qc09wdGlvbnM6IHtcbiAgICAgICAgaWdub3JlVHJ5Q2F0Y2g6IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICB9O1xufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXGRlc2t0b3BcXFxcbmV3UHJvamVjdFxcXFxjbGllbnRcXFxcYnVpbGRcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcZGVza3RvcFxcXFxuZXdQcm9qZWN0XFxcXGNsaWVudFxcXFxidWlsZFxcXFxwbHVnaW5zXFxcXGluZGV4LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9kZXNrdG9wL25ld1Byb2plY3QvY2xpZW50L2J1aWxkL3BsdWdpbnMvaW5kZXgudHNcIjtpbXBvcnQgdHlwZSB7IFBsdWdpbk9wdGlvbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xuaW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4JztcbmltcG9ydCBWdWVEZXZ0b29scyBmcm9tICd2aXRlLXBsdWdpbi12dWUtZGV2dG9vbHMnO1xuaW1wb3J0IHByb2dyZXNzIGZyb20gJ3ZpdGUtcGx1Z2luLXByb2dyZXNzJztcbmltcG9ydCB7IHNldHVwRWxlZ2FudFJvdXRlciB9IGZyb20gJy4vcm91dGVyJztcbmltcG9ydCB7IHNldHVwVW5vY3NzIH0gZnJvbSAnLi91bm9jc3MnO1xuaW1wb3J0IHsgc2V0dXBVbnBsdWdpbiB9IGZyb20gJy4vdW5wbHVnaW4nO1xuaW1wb3J0IHsgc2V0dXBIdG1sUGx1Z2luIH0gZnJvbSAnLi9odG1sJztcblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwVml0ZVBsdWdpbnModml0ZUVudjogRW52LkltcG9ydE1ldGEsIGJ1aWxkVGltZTogc3RyaW5nKSB7XG4gIGNvbnN0IHBsdWdpbnM6IFBsdWdpbk9wdGlvbiA9IFtcbiAgICB2dWUoKSxcbiAgICB2dWVKc3goKSxcbiAgICBWdWVEZXZ0b29scygpLFxuICAgIHNldHVwRWxlZ2FudFJvdXRlcigpLFxuICAgIHNldHVwVW5vY3NzKHZpdGVFbnYpLFxuICAgIC4uLnNldHVwVW5wbHVnaW4odml0ZUVudiksXG4gICAgcHJvZ3Jlc3MoKSxcbiAgICBzZXR1cEh0bWxQbHVnaW4oYnVpbGRUaW1lKVxuICBdO1xuXG4gIHJldHVybiBwbHVnaW5zO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxkZXNrdG9wXFxcXG5ld1Byb2plY3RcXFxcY2xpZW50XFxcXGJ1aWxkXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGRlc2t0b3BcXFxcbmV3UHJvamVjdFxcXFxjbGllbnRcXFxcYnVpbGRcXFxccGx1Z2luc1xcXFxyb3V0ZXIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2Rlc2t0b3AvbmV3UHJvamVjdC9jbGllbnQvYnVpbGQvcGx1Z2lucy9yb3V0ZXIudHNcIjtpbXBvcnQgdHlwZSB7IFJvdXRlTWV0YSB9IGZyb20gJ3Z1ZS1yb3V0ZXInO1xuaW1wb3J0IEVsZWdhbnRWdWVSb3V0ZXIgZnJvbSAnQGVsZWdhbnQtcm91dGVyL3Z1ZS92aXRlJztcbmltcG9ydCB0eXBlIHsgUm91dGVLZXkgfSBmcm9tICdAZWxlZ2FudC1yb3V0ZXIvdHlwZXMnO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBFbGVnYW50Um91dGVyKCkge1xuICByZXR1cm4gRWxlZ2FudFZ1ZVJvdXRlcih7XG4gICAgbGF5b3V0czoge1xuICAgICAgYmFzZTogJ3NyYy9sYXlvdXRzL2Jhc2UtbGF5b3V0L2luZGV4LnZ1ZScsXG4gICAgICBibGFuazogJ3NyYy9sYXlvdXRzL2JsYW5rLWxheW91dC9pbmRleC52dWUnLFxuICAgICAgYmc6ICdzcmMvbGF5b3V0cy9iZy1sYXlvdXQvaW5kZXgudnVlJ1xuICAgIH0sXG4gICAgY3VzdG9tUm91dGVzOiB7XG4gICAgICBuYW1lczogW1xuICAgICAgICAnZXhjZXB0aW9uXzQwMycsXG4gICAgICAgICdleGNlcHRpb25fNDA0JyxcbiAgICAgICAgJ2V4Y2VwdGlvbl81MDAnLFxuICAgICAgICAnZG9jdW1lbnRfcHJvamVjdCcsXG4gICAgICAgICdkb2N1bWVudF9wcm9qZWN0LWxpbmsnLFxuICAgICAgXVxuICAgIH0sXG4gICAgcm91dGVQYXRoVHJhbnNmb3JtZXIocm91dGVOYW1lLCByb3V0ZVBhdGgpIHtcbiAgICAgIGNvbnN0IGtleSA9IHJvdXRlTmFtZSBhcyBSb3V0ZUtleTtcblxuICAgICAgaWYgKGtleSA9PT0gJ2xvZ2luJykge1xuICAgICAgICBjb25zdCBtb2R1bGVzOiBVbmlvbktleS5Mb2dpbk1vZHVsZVtdID0gWydwd2QtbG9naW4nLCAnY29kZS1sb2dpbicsICdyZWdpc3RlcicsICdyZXNldC1wd2QnLCAnYmluZC13ZWNoYXQnXTtcblxuICAgICAgICBjb25zdCBtb2R1bGVSZWcgPSBtb2R1bGVzLmpvaW4oJ3wnKTtcblxuICAgICAgICByZXR1cm4gYC9sb2dpbi86bW9kdWxlKCR7bW9kdWxlUmVnfSk/YDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJvdXRlUGF0aDtcbiAgICB9LFxuICAgIG9uUm91dGVNZXRhR2VuKHJvdXRlTmFtZSkge1xuICAgICAgY29uc3Qga2V5ID0gcm91dGVOYW1lIGFzIFJvdXRlS2V5O1xuXG4gICAgICBjb25zdCBjb25zdGFudFJvdXRlczogUm91dGVLZXlbXSA9IFsnbG9naW4nLCAnNDAzJywgJzQwNCcsICc1MDAnXTtcblxuICAgICAgY29uc3QgbWV0YTogUGFydGlhbDxSb3V0ZU1ldGE+ID0ge1xuICAgICAgICB0aXRsZToga2V5LFxuICAgICAgICBpMThuS2V5OiBgcm91dGUuJHtrZXl9YCBhcyBBcHAuSTE4bi5JMThuS2V5XG4gICAgICB9O1xuXG4gICAgICBpZiAoY29uc3RhbnRSb3V0ZXMuaW5jbHVkZXMoa2V5KSkge1xuICAgICAgICBtZXRhLmNvbnN0YW50ID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1ldGE7XG4gICAgfVxuICB9KTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcZGVza3RvcFxcXFxuZXdQcm9qZWN0XFxcXGNsaWVudFxcXFxidWlsZFxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxkZXNrdG9wXFxcXG5ld1Byb2plY3RcXFxcY2xpZW50XFxcXGJ1aWxkXFxcXHBsdWdpbnNcXFxcdW5vY3NzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9kZXNrdG9wL25ld1Byb2plY3QvY2xpZW50L2J1aWxkL3BsdWdpbnMvdW5vY3NzLnRzXCI7aW1wb3J0IHByb2Nlc3MgZnJvbSAnbm9kZTpwcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgdW5vY3NzIGZyb20gJ0B1bm9jc3Mvdml0ZSc7XG5pbXBvcnQgcHJlc2V0SWNvbnMgZnJvbSAnQHVub2Nzcy9wcmVzZXQtaWNvbnMnO1xuaW1wb3J0IHsgRmlsZVN5c3RlbUljb25Mb2FkZXIgfSBmcm9tICdAaWNvbmlmeS91dGlscy9saWIvbG9hZGVyL25vZGUtbG9hZGVycyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cFVub2Nzcyh2aXRlRW52OiBFbnYuSW1wb3J0TWV0YSkge1xuICBjb25zdCB7IFZJVEVfSUNPTl9QUkVGSVgsIFZJVEVfSUNPTl9MT0NBTF9QUkVGSVggfSA9IHZpdGVFbnY7XG5cbiAgY29uc3QgbG9jYWxJY29uUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnc3JjL2Fzc2V0cy9zdmctaWNvbicpO1xuXG4gIC8qKiBUaGUgbmFtZSBvZiB0aGUgbG9jYWwgaWNvbiBjb2xsZWN0aW9uICovXG4gIGNvbnN0IGNvbGxlY3Rpb25OYW1lID0gVklURV9JQ09OX0xPQ0FMX1BSRUZJWC5yZXBsYWNlKGAke1ZJVEVfSUNPTl9QUkVGSVh9LWAsICcnKTtcblxuICByZXR1cm4gdW5vY3NzKHtcbiAgICBwcmVzZXRzOiBbXG4gICAgICBwcmVzZXRJY29ucyh7XG4gICAgICAgIHByZWZpeDogYCR7VklURV9JQ09OX1BSRUZJWH0tYCxcbiAgICAgICAgc2NhbGU6IDEsXG4gICAgICAgIGV4dHJhUHJvcGVydGllczoge1xuICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snXG4gICAgICAgIH0sXG4gICAgICAgIGNvbGxlY3Rpb25zOiB7XG4gICAgICAgICAgW2NvbGxlY3Rpb25OYW1lXTogRmlsZVN5c3RlbUljb25Mb2FkZXIobG9jYWxJY29uUGF0aCwgc3ZnID0+XG4gICAgICAgICAgICBzdmcucmVwbGFjZSgvXjxzdmdcXHMvLCAnPHN2ZyB3aWR0aD1cIjFlbVwiIGhlaWdodD1cIjFlbVwiICcpXG4gICAgICAgICAgKVxuICAgICAgICB9LFxuICAgICAgICB3YXJuOiB0cnVlXG4gICAgICB9KVxuICAgIF1cbiAgfSk7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXGRlc2t0b3BcXFxcbmV3UHJvamVjdFxcXFxjbGllbnRcXFxcYnVpbGRcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcZGVza3RvcFxcXFxuZXdQcm9qZWN0XFxcXGNsaWVudFxcXFxidWlsZFxcXFxwbHVnaW5zXFxcXHVucGx1Z2luLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9kZXNrdG9wL25ld1Byb2plY3QvY2xpZW50L2J1aWxkL3BsdWdpbnMvdW5wbHVnaW4udHNcIjtpbXBvcnQgcHJvY2VzcyBmcm9tICdub2RlOnByb2Nlc3MnO1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luT3B0aW9uIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgSWNvbnMgZnJvbSAndW5wbHVnaW4taWNvbnMvdml0ZSc7XG5pbXBvcnQgSWNvbnNSZXNvbHZlciBmcm9tICd1bnBsdWdpbi1pY29ucy9yZXNvbHZlcic7XG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJztcbmltcG9ydCB7IEVsZW1lbnRQbHVzUmVzb2x2ZXIgfSBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnMnO1xuaW1wb3J0IHsgRmlsZVN5c3RlbUljb25Mb2FkZXIgfSBmcm9tICd1bnBsdWdpbi1pY29ucy9sb2FkZXJzJztcbmltcG9ydCB7IGNyZWF0ZVN2Z0ljb25zUGx1Z2luIH0gZnJvbSAndml0ZS1wbHVnaW4tc3ZnLWljb25zJztcblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwVW5wbHVnaW4odml0ZUVudjogRW52LkltcG9ydE1ldGEpIHtcbiAgY29uc3QgeyBWSVRFX0lDT05fUFJFRklYLCBWSVRFX0lDT05fTE9DQUxfUFJFRklYIH0gPSB2aXRlRW52O1xuXG4gIGNvbnN0IGxvY2FsSWNvblBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3NyYy9hc3NldHMvc3ZnLWljb24nKTtcblxuICAvKiogVGhlIG5hbWUgb2YgdGhlIGxvY2FsIGljb24gY29sbGVjdGlvbiAqL1xuICBjb25zdCBjb2xsZWN0aW9uTmFtZSA9IFZJVEVfSUNPTl9MT0NBTF9QUkVGSVgucmVwbGFjZShgJHtWSVRFX0lDT05fUFJFRklYfS1gLCAnJyk7XG5cbiAgY29uc3QgcGx1Z2luczogUGx1Z2luT3B0aW9uW10gPSBbXG4gICAgSWNvbnMoe1xuICAgICAgY29tcGlsZXI6ICd2dWUzJyxcbiAgICAgIGN1c3RvbUNvbGxlY3Rpb25zOiB7XG4gICAgICAgIFtjb2xsZWN0aW9uTmFtZV06IEZpbGVTeXN0ZW1JY29uTG9hZGVyKGxvY2FsSWNvblBhdGgsIHN2ZyA9PlxuICAgICAgICAgIHN2Zy5yZXBsYWNlKC9ePHN2Z1xccy8sICc8c3ZnIHdpZHRoPVwiMWVtXCIgaGVpZ2h0PVwiMWVtXCIgJylcbiAgICAgICAgKVxuICAgICAgfSxcbiAgICAgIHNjYWxlOiAxLFxuICAgICAgZGVmYXVsdENsYXNzOiAnaW5saW5lLWJsb2NrJ1xuICAgIH0pLFxuICAgIENvbXBvbmVudHMoe1xuICAgICAgZHRzOiAnc3JjL3R5cGluZ3MvY29tcG9uZW50cy5kLnRzJyxcbiAgICAgIHR5cGVzOiBbeyBmcm9tOiAndnVlLXJvdXRlcicsIG5hbWVzOiBbJ1JvdXRlckxpbmsnLCAnUm91dGVyVmlldyddIH1dLFxuICAgICAgcmVzb2x2ZXJzOiBbXG4gICAgICAgIC8vIGF1dG8gaW1wb3J0IEVsZW1lbnQgUGx1cyBjb21wb25lbnRzXHUzMDAyIGZ1bGwgaW1wb3J0IHRvIHNlZSAvc3JjL3BsdWdpbnMvdWkudHNcbiAgICAgICAgRWxlbWVudFBsdXNSZXNvbHZlcih7XG4gICAgICAgICAgLy8gbm8gdG8gaW1wb3J0IHN0eWxlLCBmdWxsIGltcG9ydCB0byBzZWUgL3NyYy9wbHVnaW5zL2Fzc2V0cy50c1xuICAgICAgICAgIGltcG9ydFN0eWxlOiBmYWxzZVxuICAgICAgICB9KSxcbiAgICAgICAgSWNvbnNSZXNvbHZlcih7IGN1c3RvbUNvbGxlY3Rpb25zOiBbY29sbGVjdGlvbk5hbWVdLCBjb21wb25lbnRQcmVmaXg6IFZJVEVfSUNPTl9QUkVGSVggfSlcbiAgICAgIF1cbiAgICB9KSxcbiAgICBjcmVhdGVTdmdJY29uc1BsdWdpbih7XG4gICAgICBpY29uRGlyczogW2xvY2FsSWNvblBhdGhdLFxuICAgICAgc3ltYm9sSWQ6IGAke1ZJVEVfSUNPTl9MT0NBTF9QUkVGSVh9LVtkaXJdLVtuYW1lXWAsXG4gICAgICBpbmplY3Q6ICdib2R5LWxhc3QnLFxuICAgICAgY3VzdG9tRG9tSWQ6ICdfX1NWR19JQ09OX0xPQ0FMX18nXG4gICAgfSlcbiAgXTtcblxuICByZXR1cm4gcGx1Z2lucztcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcZGVza3RvcFxcXFxuZXdQcm9qZWN0XFxcXGNsaWVudFxcXFxidWlsZFxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxkZXNrdG9wXFxcXG5ld1Byb2plY3RcXFxcY2xpZW50XFxcXGJ1aWxkXFxcXHBsdWdpbnNcXFxcaHRtbC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovZGVza3RvcC9uZXdQcm9qZWN0L2NsaWVudC9idWlsZC9wbHVnaW5zL2h0bWwudHNcIjtpbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBIdG1sUGx1Z2luKGJ1aWxkVGltZTogc3RyaW5nKSB7XG4gIGNvbnN0IHBsdWdpbjogUGx1Z2luID0ge1xuICAgIG5hbWU6ICdodG1sLXBsdWdpbicsXG4gICAgYXBwbHk6ICdidWlsZCcsXG4gICAgdHJhbnNmb3JtSW5kZXhIdG1sKGh0bWwpIHtcbiAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoJzxoZWFkPicsIGA8aGVhZD5cXG4gICAgPG1ldGEgbmFtZT1cImJ1aWxkVGltZVwiIGNvbnRlbnQ9XCIke2J1aWxkVGltZX1cIj5gKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHBsdWdpbjtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcZGVza3RvcFxcXFxuZXdQcm9qZWN0XFxcXGNsaWVudFxcXFxzcmNcXFxcdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGRlc2t0b3BcXFxcbmV3UHJvamVjdFxcXFxjbGllbnRcXFxcc3JjXFxcXHV0aWxzXFxcXHNlcnZpY2UudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2Rlc2t0b3AvbmV3UHJvamVjdC9jbGllbnQvc3JjL3V0aWxzL3NlcnZpY2UudHNcIjtpbXBvcnQganNvbjUgZnJvbSAnanNvbjUnO1xuXG4vKipcbiAqIENyZWF0ZSBzZXJ2aWNlIGNvbmZpZyBieSBjdXJyZW50IGVudlxuICpcbiAqIEBwYXJhbSBlbnYgVGhlIGN1cnJlbnQgZW52XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTZXJ2aWNlQ29uZmlnKGVudjogRW52LkltcG9ydE1ldGEpIHtcbiAgY29uc3QgeyBWSVRFX1NFUlZJQ0VfQkFTRV9VUkwsIFZJVEVfT1RIRVJfU0VSVklDRV9CQVNFX1VSTCB9ID0gZW52O1xuXG4gIGxldCBvdGhlciA9IHt9IGFzIFJlY29yZDxBcHAuU2VydmljZS5PdGhlckJhc2VVUkxLZXksIHN0cmluZz47XG4gIHRyeSB7XG4gICAgb3RoZXIgPSBqc29uNS5wYXJzZShWSVRFX09USEVSX1NFUlZJQ0VfQkFTRV9VUkwpO1xuICB9IGNhdGNoIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUuZXJyb3IoJ1ZJVEVfT1RIRVJfU0VSVklDRV9CQVNFX1VSTCBpcyBub3QgYSB2YWxpZCBqc29uNSBzdHJpbmcnKTtcbiAgfVxuXG4gIGNvbnN0IGh0dHBDb25maWc6IEFwcC5TZXJ2aWNlLlNpbXBsZVNlcnZpY2VDb25maWcgPSB7XG4gICAgYmFzZVVSTDogVklURV9TRVJWSUNFX0JBU0VfVVJMLFxuICAgIG90aGVyXG4gIH07XG5cbiAgY29uc3Qgb3RoZXJIdHRwS2V5cyA9IE9iamVjdC5rZXlzKGh0dHBDb25maWcub3RoZXIpIGFzIEFwcC5TZXJ2aWNlLk90aGVyQmFzZVVSTEtleVtdO1xuXG4gIGNvbnN0IG90aGVyQ29uZmlnOiBBcHAuU2VydmljZS5PdGhlclNlcnZpY2VDb25maWdJdGVtW10gPSBvdGhlckh0dHBLZXlzLm1hcChrZXkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBrZXksXG4gICAgICBiYXNlVVJMOiBodHRwQ29uZmlnLm90aGVyW2tleV0sXG4gICAgICBwcm94eVBhdHRlcm46IGNyZWF0ZVByb3h5UGF0dGVybihrZXkpXG4gICAgfTtcbiAgfSk7XG5cbiAgY29uc3QgY29uZmlnOiBBcHAuU2VydmljZS5TZXJ2aWNlQ29uZmlnID0ge1xuICAgIGJhc2VVUkw6IGh0dHBDb25maWcuYmFzZVVSTCxcbiAgICBwcm94eVBhdHRlcm46IGNyZWF0ZVByb3h5UGF0dGVybigpLFxuICAgIG90aGVyOiBvdGhlckNvbmZpZ1xuICB9O1xuXG4gIHJldHVybiBjb25maWc7XG59XG5cbi8qKlxuICogZ2V0IGJhY2tlbmQgc2VydmljZSBiYXNlIHVybFxuICpcbiAqIEBwYXJhbSBlbnYgLSB0aGUgY3VycmVudCBlbnZcbiAqIEBwYXJhbSBpc1Byb3h5IC0gaWYgdXNlIHByb3h5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXJ2aWNlQmFzZVVSTChlbnY6IEVudi5JbXBvcnRNZXRhLCBpc1Byb3h5OiBib29sZWFuKSB7XG4gIGNvbnN0IHsgYmFzZVVSTCwgb3RoZXIgfSA9IGNyZWF0ZVNlcnZpY2VDb25maWcoZW52KTtcblxuICBjb25zdCBvdGhlckJhc2VVUkwgPSB7fSBhcyBSZWNvcmQ8QXBwLlNlcnZpY2UuT3RoZXJCYXNlVVJMS2V5LCBzdHJpbmc+O1xuXG4gIG90aGVyLmZvckVhY2goaXRlbSA9PiB7XG4gICAgb3RoZXJCYXNlVVJMW2l0ZW0ua2V5XSA9IGlzUHJveHkgPyBpdGVtLnByb3h5UGF0dGVybiA6IGl0ZW0uYmFzZVVSTDtcbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBiYXNlVVJMOiBpc1Byb3h5ID8gY3JlYXRlUHJveHlQYXR0ZXJuKCkgOiBiYXNlVVJMLFxuICAgIG90aGVyQmFzZVVSTFxuICB9O1xufVxuXG4vKipcbiAqIEdldCBwcm94eSBwYXR0ZXJuIG9mIGJhY2tlbmQgc2VydmljZSBiYXNlIHVybFxuICpcbiAqIEBwYXJhbSBrZXkgSWYgbm90IHNldCwgd2lsbCB1c2UgdGhlIGRlZmF1bHQga2V5XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVByb3h5UGF0dGVybihrZXk/OiBBcHAuU2VydmljZS5PdGhlckJhc2VVUkxLZXkpIHtcbiAgaWYgKCFrZXkpIHtcbiAgICByZXR1cm4gJy9wcm94eS1kZWZhdWx0JztcbiAgfVxuXG4gIHJldHVybiBgL3Byb3h5LSR7a2V5fWA7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXGRlc2t0b3BcXFxcbmV3UHJvamVjdFxcXFxjbGllbnRcXFxcYnVpbGRcXFxcY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxkZXNrdG9wXFxcXG5ld1Byb2plY3RcXFxcY2xpZW50XFxcXGJ1aWxkXFxcXGNvbmZpZ1xcXFxjbGktaGVscGVyLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9kZXNrdG9wL25ld1Byb2plY3QvY2xpZW50L2J1aWxkL2NvbmZpZy9jbGktaGVscGVyLnRzXCI7LyogZXNsaW50LWRpc2FibGUgKi9cbmltcG9ydCBwcm9jZXNzIGZyb20gJ25vZGU6cHJvY2VzcydcbmltcG9ydCByZWFkbGluZSBmcm9tICdub2RlOnJlYWRsaW5lJ1xuXG5mdW5jdGlvbiBjbGVhclNjcmVlbigpIHtcbiAgY29uc3QgcmVwZWF0Q291bnQgPSBwcm9jZXNzLnN0ZG91dC5yb3dzIC0gMlxuICBjb25zdCBibGFuayA9IHJlcGVhdENvdW50ID4gMCA/ICdcXG4nLnJlcGVhdChyZXBlYXRDb3VudCkgOiAnJ1xuICBjb25zb2xlLmxvZyhibGFuaylcbiAgcmVhZGxpbmUuY3Vyc29yVG8ocHJvY2Vzcy5zdGRvdXQsIDAsIDApXG4gIHJlYWRsaW5lLmNsZWFyU2NyZWVuRG93bihwcm9jZXNzLnN0ZG91dClcbn1cblxuZnVuY3Rpb24gZm9ybWF0dGVyKG9wZW46IHN0cmluZywgY2xvc2U6IHN0cmluZywgcmVwbGFjZSA9IG9wZW4pIHtcbiAgcmV0dXJuIChpbnB1dDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3Qgc3RyaW5nID0gYCR7aW5wdXR9YFxuICAgIGNvbnN0IGluZGV4ID0gc3RyaW5nLmluZGV4T2YoY2xvc2UsIG9wZW4ubGVuZ3RoKVxuICAgIHJldHVybiB+aW5kZXggPyBvcGVuICsgcmVwbGFjZUNsb3NlKHN0cmluZywgY2xvc2UsIHJlcGxhY2UsIGluZGV4KSArIGNsb3NlIDogb3BlbiArIHN0cmluZyArIGNsb3NlXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVwbGFjZUNsb3NlKHN0cmluZzogc3RyaW5nLCBjbG9zZTogc3RyaW5nLCByZXBsYWNlOiBzdHJpbmcsIGluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xuICBjb25zdCBzdGFydCA9IHN0cmluZy5zdWJzdHJpbmcoMCwgaW5kZXgpICsgcmVwbGFjZVxuICBjb25zdCBlbmQgPSBzdHJpbmcuc3Vic3RyaW5nKGluZGV4ICsgY2xvc2UubGVuZ3RoKVxuICBjb25zdCBuZXh0SW5kZXggPSBlbmQuaW5kZXhPZihjbG9zZSlcbiAgcmV0dXJuIH5uZXh0SW5kZXggPyBzdGFydCArIHJlcGxhY2VDbG9zZShlbmQsIGNsb3NlLCByZXBsYWNlLCBuZXh0SW5kZXgpIDogc3RhcnQgKyBlbmRcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29sb3JzKCkge1xuICByZXR1cm4ge1xuICAgIGJnQmxhY2s6IGZvcm1hdHRlcignXFx4MUJbNDBtJywgJ1xceDFCWzQ5bScpLFxuICAgIGJnQmx1ZTogZm9ybWF0dGVyKCdcXHgxQls0NG0nLCAnXFx4MUJbNDltJyksXG4gICAgYmdDeWFuOiBmb3JtYXR0ZXIoJ1xceDFCWzQ2bScsICdcXHgxQls0OW0nKSxcbiAgICBiZ0dyZWVuOiBmb3JtYXR0ZXIoJ1xceDFCWzQybScsICdcXHgxQls0OW0nKSxcbiAgICBiZ01hZ2VudGE6IGZvcm1hdHRlcignXFx4MUJbNDVtJywgJ1xceDFCWzQ5bScpLFxuICAgIGJnUmVkOiBmb3JtYXR0ZXIoJ1xceDFCWzQxbScsICdcXHgxQls0OW0nLCAnXFx4MUJbMjJtXFx4MUJbMW0nKSxcbiAgICBiZ1doaXRlOiBmb3JtYXR0ZXIoJ1xceDFCWzQ3bScsICdcXHgxQls0OW0nKSxcbiAgICBiZ1llbGxvdzogZm9ybWF0dGVyKCdcXHgxQls0M20nLCAnXFx4MUJbNDltJyksXG4gICAgYmxhY2s6IGZvcm1hdHRlcignXFx4MUJbMzBtJywgJ1xceDFCWzM5bScpLFxuICAgIGJsdWU6IGZvcm1hdHRlcignXFx4MUJbMzRtJywgJ1xceDFCWzM5bScpLFxuICAgIGJvbGQ6IGZvcm1hdHRlcignXFx4MUJbMW0nLCAnXFx4MUJbMjJtJywgJ1xceDFCWzIybVxceDFCWzFtJyksXG4gICAgY3lhbjogZm9ybWF0dGVyKCdcXHgxQlszNm0nLCAnXFx4MUJbMzltJyksXG4gICAgZGltOiBmb3JtYXR0ZXIoJ1xceDFCWzJtJywgJ1xceDFCWzIybScsICdcXHgxQlsyMm1cXHgxQlsybScpLFxuICAgIGdyYXk6IGZvcm1hdHRlcignXFx4MUJbOTBtJywgJ1xceDFCWzM5bScpLFxuICAgIGdyZWVuOiBmb3JtYXR0ZXIoJ1xceDFCWzMybScsICdcXHgxQlszOW0nKSxcbiAgICBoaWRkZW46IGZvcm1hdHRlcignXFx4MUJbOG0nLCAnXFx4MUJbMjhtJyksXG4gICAgaW52ZXJzZTogZm9ybWF0dGVyKCdcXHgxQls3bScsICdcXHgxQlsyN20nKSxcbiAgICBpdGFsaWM6IGZvcm1hdHRlcignXFx4MUJbM20nLCAnXFx4MUJbMjNtJyksXG4gICAgbWFnZW50YTogZm9ybWF0dGVyKCdcXHgxQlszNW0nLCAnXFx4MUJbMzltJyksXG4gICAgcmVkOiBmb3JtYXR0ZXIoJ1xceDFCWzMxbScsICdcXHgxQlszOW0nKSxcbiAgICByZXNldDogKHM6IHN0cmluZykgPT4gYFxceDFCWzBtJHtzfVxceDFCWzBtYCxcbiAgICBzdHJpa2V0aHJvdWdoOiBmb3JtYXR0ZXIoJ1xceDFCWzltJywgJ1xceDFCWzI5bScpLFxuICAgIHVuZGVybGluZTogZm9ybWF0dGVyKCdcXHgxQls0bScsICdcXHgxQlsyNG0nKSxcbiAgICB3aGl0ZTogZm9ybWF0dGVyKCdcXHgxQlszN20nLCAnXFx4MUJbMzltJyksXG4gICAgeWVsbG93OiBmb3JtYXR0ZXIoJ1xceDFCWzMzbScsICdcXHgxQlszOW0nKSxcbiAgfVxufVxuXG5leHBvcnQgeyBjbGVhclNjcmVlbiwgY3JlYXRlQ29sb3JzIH1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcZGVza3RvcFxcXFxuZXdQcm9qZWN0XFxcXGNsaWVudFxcXFxidWlsZFxcXFxjb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGRlc2t0b3BcXFxcbmV3UHJvamVjdFxcXFxjbGllbnRcXFxcYnVpbGRcXFxcY29uZmlnXFxcXHByb3h5LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9kZXNrdG9wL25ld1Byb2plY3QvY2xpZW50L2J1aWxkL2NvbmZpZy9wcm94eS50c1wiO2ltcG9ydCB0eXBlIHsgSHR0cFByb3h5LCBQcm94eU9wdGlvbnMgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IGNyZWF0ZVNlcnZpY2VDb25maWcgfSBmcm9tICcuLi8uLi9zcmMvdXRpbHMvc2VydmljZSc7XG5pbXBvcnQgeyBjbGVhclNjcmVlbiwgY3JlYXRlQ29sb3JzIH0gZnJvbSAnLi9jbGktaGVscGVyJztcbmNvbnN0IGNvbG9ycyA9IGNyZWF0ZUNvbG9ycygpO1xuXG4vKipcbiAqIFx1OEJCRVx1N0Y2RSBodHRwIFx1NEVFM1x1NzQwNlxuICpcbiAqIEBwYXJhbSBlbnYgLSBUaGUgY3VycmVudCBlbnZcbiAqIEBwYXJhbSBlbmFibGUgLSBJZiBlbmFibGUgaHR0cCBwcm94eVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVml0ZVByb3h5KGVudjogRW52LkltcG9ydE1ldGEsIGVuYWJsZTogYm9vbGVhbikge1xuICBjb25zdCBpc0VuYWJsZUh0dHBQcm94eSA9IGVuYWJsZSAmJiBlbnYuVklURV9IVFRQX1BST1hZID09PSAnWSc7XG5cbiAgaWYgKCFpc0VuYWJsZUh0dHBQcm94eSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuICBjb25zdCB7IGJhc2VVUkwsIHByb3h5UGF0dGVybiwgb3RoZXIgfSA9IGNyZWF0ZVNlcnZpY2VDb25maWcoZW52KTtcblxuICBjb25zdCBwcm94eTogUmVjb3JkPHN0cmluZywgUHJveHlPcHRpb25zPiA9IGNyZWF0ZVByb3h5SXRlbSh7IGJhc2VVUkwsIHByb3h5UGF0dGVybiB9KTtcblxuICBvdGhlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgIE9iamVjdC5hc3NpZ24ocHJveHksIGNyZWF0ZVByb3h5SXRlbShpdGVtKSk7XG4gIH0pO1xuXG4gIHJldHVybiBwcm94eTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUHJveHlJdGVtKGl0ZW06IEFwcC5TZXJ2aWNlLlNlcnZpY2VDb25maWdJdGVtKSB7XG4gIGNvbnN0IHByb3h5OiBSZWNvcmQ8c3RyaW5nLCBQcm94eU9wdGlvbnM+ID0ge307XG5cbiAgcHJveHlbaXRlbS5wcm94eVBhdHRlcm5dID0ge1xuICAgIHRhcmdldDogaXRlbS5iYXNlVVJMLFxuICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICBjb25maWd1cmU6IChfcHJveHk6IEh0dHBQcm94eS5TZXJ2ZXIsIG9wdGlvbnM6IFByb3h5T3B0aW9ucykgPT4ge1xuICAgICAgX3Byb3h5Lm9uKCdwcm94eVJlcScsIChfcHJveHlSZXEsIHJlcSwgX3JlcykgPT4ge1xuICAgICAgICBjbGVhclNjcmVlbigpO1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBjb25zb2xlLmxvZyhjb2xvcnMuYmdZZWxsb3coYCAgJHtyZXEubWV0aG9kfSAgYCksIGNvbG9ycy5ncmVlbihgJHtvcHRpb25zLnRhcmdldH0ke3JlcS51cmx9YCkpO1xuICAgICAgfSk7XG4gICAgICBfcHJveHkub24oJ2Vycm9yJywgKF9lcnIsIHJlcSwgX3JlcykgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBjb25zb2xlLmxvZyhjb2xvcnMuYmdSZWQoYEVycm9yXHVGRjFBJHtyZXEubWV0aG9kfSAgYCksIGNvbG9ycy5ncmVlbihgJHtvcHRpb25zLnRhcmdldH0ke3JlcS51cmx9YCkpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICByZXdyaXRlOiBwYXRoID0+IHBhdGgucmVwbGFjZShuZXcgUmVnRXhwKGBeJHtpdGVtLnByb3h5UGF0dGVybn1gKSwgJycpXG4gIH07XG5cbiAgcmV0dXJuIHByb3h5O1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxkZXNrdG9wXFxcXG5ld1Byb2plY3RcXFxcY2xpZW50XFxcXGJ1aWxkXFxcXGNvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcZGVza3RvcFxcXFxuZXdQcm9qZWN0XFxcXGNsaWVudFxcXFxidWlsZFxcXFxjb25maWdcXFxcdGltZS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovZGVza3RvcC9uZXdQcm9qZWN0L2NsaWVudC9idWlsZC9jb25maWcvdGltZS50c1wiO2ltcG9ydCBkYXlqcyBmcm9tICdkYXlqcyc7XG5pbXBvcnQgdXRjIGZyb20gJ2RheWpzL3BsdWdpbi91dGMnO1xuaW1wb3J0IHRpbWV6b25lIGZyb20gJ2RheWpzL3BsdWdpbi90aW1lem9uZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCdWlsZFRpbWUoKSB7XG4gIGRheWpzLmV4dGVuZCh1dGMpO1xuICBkYXlqcy5leHRlbmQodGltZXpvbmUpO1xuXG4gIGNvbnN0IGJ1aWxkVGltZSA9IGRheWpzLnR6KERhdGUubm93KCksICdBc2lhL1NoYW5naGFpJykuZm9ybWF0KCdZWVlZLU1NLUREIEhIOm1tOnNzJyk7XG5cbiAgcmV0dXJuIGJ1aWxkVGltZTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFEsT0FBT0EsY0FBYTtBQUNsUyxTQUFTLEtBQUsscUJBQXFCO0FBQ25DLFNBQVMsY0FBYyxlQUFlOzs7QUNEdEMsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sWUFBWTtBQUNuQixPQUFPLGlCQUFpQjtBQUN4QixPQUFPLGNBQWM7OztBQ0hyQixPQUFPLHNCQUFzQjtBQUd0QixTQUFTLHFCQUFxQjtBQUNuQyxTQUFPLGlCQUFpQjtBQUFBLElBQ3RCLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxNQUNQLElBQUk7QUFBQSxJQUNOO0FBQUEsSUFDQSxjQUFjO0FBQUEsTUFDWixPQUFPO0FBQUEsUUFDTDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFB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
