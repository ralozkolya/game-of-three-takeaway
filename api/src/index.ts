import * as express from 'express';
import { createServer } from 'http';
import * as cors from 'cors';

import { initGameManager } from './game-manager';

const app = express();
const server = createServer(app);

app.use(cors());

initGameManager(server);

const port = parseInt(process.env.PORT) || 3000;

server.listen(port, () => console.log(`Listening on port ${port}...`));
