import { InvalidConfigError, loadConfig, type Config } from './config/env.js';

export function loadConfigOrExit(): Config {
  try {
    return loadConfig();
  } catch (error) {
    if (error instanceof InvalidConfigError) {
      process.stderr.write(
        `${error.message}\n\nCopie backend/.env.example para backend/.env e preencha os valores.\n`,
      );
      process.exit(1);
    }
    throw error;
  }
}
