import { defineConfig } from 'tsup';
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    discordjs: 'src/adapters/discordjs.ts',
    grammy: 'src/adapters/grammy.ts',
    telegraf: 'src/adapters/telegraf.ts',
  },
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' };
  },
  dts: true,
  clean: true,
  target: 'node18',
  treeshake: true,
});
