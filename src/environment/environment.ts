import { Environment } from '../interface/environment.interface';
import { environmentDev } from './environment.dev';
import { environmentProd } from './environment.prod';

export const environment: Environment = (process.env.NODE_ENV === 'production') ? environmentProd : environmentDev;
