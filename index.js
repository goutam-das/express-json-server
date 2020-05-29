const exppress = require('express');
const jsonServer = require('json-server');
const auth = require('json-server-auth')

const { PORT = 5000 } = process.env;
const app = exppress();
const router = jsonServer.router('db.json');

app.db = router.db;

app.use(auth);
app.use('/api', router);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})