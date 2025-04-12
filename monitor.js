import express from 'express';
import { createBullBoard } from 'bull-board';
import { BullMQAdapter } from 'bull-board/bullMQAdapter.js';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const app = express();
const connection = new IORedis();

const ttsQueue = new Queue('ttsQueue', { connection });

const { router } = createBullBoard([
  new BullMQAdapter(ttsQueue),
]);

app.use('/admin/queues', router);

app.listen(1234, () => {
  console.log('📊 Bull Board is running on http://localhost:1234/admin/queues');
});
