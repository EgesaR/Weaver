export const hooks = {
  readPackage: (pkg) => {
    if (['@tailwindcss/oxide', 'esbuild'].includes(pkg.name)) {
      pkg.scripts = pkg.scripts || {};
      pkg.scripts.build = pkg.scripts.build || 'true';
    }
    return pkg;
  },
};
