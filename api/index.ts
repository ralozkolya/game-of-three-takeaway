import * as express from 'express';
import { createServer } from 'http';
import * as cors from 'cors';
import * as path from 'path';

import { initGameService } from './services/game';

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.static(path.join(__dirname, '../../build')));

initGameService(server);

const port = parseInt(process.env.PORT) || 3030;

server.listen(port, () => console.log(`Listening on port ${port}...`));
