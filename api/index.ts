import * as express from 'express';
import { createServer } from 'http';
import * as cors from 'cors';
import * as path from 'path';

import { initWSService } from './ws-service';

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.static(path.join(__dirname, '../../build')));

initWSService(server);

const port = parseInt(process.env.PORT) || 3030;

server.listen(port, () => console.log(`Listening on port ${port}...`));
