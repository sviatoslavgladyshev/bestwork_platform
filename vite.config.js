import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import polyfillNode from 'rollup-plugin-polyfill-node';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: [],
      },
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  esbuild: {
    loader: 'jsx',
    include: /\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
      define: {
        global: 'globalThis',
        'process.env': JSON.stringify(process.env),
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
          global: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
    include: [
      '@aws-amplify/ui-react',
      '@aws-amplify/core',
      'buffer',
    ],
  },
  build: {
    rollupOptions: {
      plugins: [polyfillNode()],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['aws-amplify', '@aws-amplify/ui-react', '@aws-amplify/core'],
        },
      },
    },
  },
  server: {
    cors: true,
    allowedHosts: ['https://platform.bestwork.ai'],
  },
});