import * as express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send('test');
});

const port = parseInt(process.env.PORT) || 3000;

app.listen(port, () => console.log(`Listening on port ${port}`));
