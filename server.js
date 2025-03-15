import Koa from 'koa'
import router from './routes/auth.js'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'

const app = new Koa()

app.use(cors());

app.use(bodyParser());

app.use(router.routes());
app.use(router.allowedMethods());

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

