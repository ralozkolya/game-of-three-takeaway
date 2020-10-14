import dev from './dev';
import test from './test';
import prod from './prod';
import IEnvironment from './env.types';

let env: IEnvironment;

// Update once other environments are added
switch (process.env.REACT_APP_ENV) {
    case 'test':
    case 'testing':
        env = test;
        break;
    case 'prod':
    case 'produnction':
        env = prod;
        break;
    default:
        env = dev;
}

export default env;
