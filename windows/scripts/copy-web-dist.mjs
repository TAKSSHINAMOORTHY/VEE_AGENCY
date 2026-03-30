import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDist = path.resolve(__dirname, '..', '..', 'dist');
const targetDist = path.resolve(__dirname, '..', 'web-dist');

async function run() {
  try {
    await fs.access(sourceDist);
  } catch {
    throw new Error('Root dist folder not found. Run the root build first.');
  }

  await fs.rm(targetDist, { recursive: true, force: true });
  await fs.mkdir(targetDist, { recursive: true });
  await fs.cp(sourceDist, targetDist, { recursive: true });

  console.log(`Copied ${sourceDist} -> ${targetDist}`);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
