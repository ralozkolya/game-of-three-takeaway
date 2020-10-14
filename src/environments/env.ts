import dev from './dev';
import test from './test';
import IEnvironment from './env.types';

let env: IEnvironment;

// Update once other environments are added
switch (process.env.REACT_APP_ENV) {
    case 'test':
        env = test;
        break;
    default:
        env = dev;
}

export default env;
