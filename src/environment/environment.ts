import type { Environment } from '../interface/environment.interface.ts';
import { environmentDev } from './environment.dev.ts';
import { environmentProd } from './environment.prod.ts';
import path from "path";

const { default: metadata } = await import(path.resolve(import.meta.dirname, '../../', 'package.json'), { with: { type: 'json' } });
export const environment: Environment = {
    ...((process.env.NODE_ENV === 'production') ? environmentProd : environmentDev),
    version: metadata.version,
};
