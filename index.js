const sharp = require('sharp');
const  IMAGE_RESIZE_QUEUE = require('./constants').IMAGE_RESIZE_QUEUE;

const minimize = async ({ originalName, path, sizes = [100, 200, 400] }) => {
  const image = sharp(`${path}/${originalName}`);

  await Promise.allSettled(
    sizes.map((requestedSize) => {
      image
        .rotate()

        .resize({ width: requestedSize })
        .jpeg({ mozjpeg: true })
        .toFile(`${path}/${requestedSize}-${originalName}`, (err, info) => {
          if (err) {
            console.log('err', err);
          } else {
            console.log('success', info);
          }
        });
    }),
  );
};

const amqp = require('amqplib');
var channel, connection;
connectQueue(); // call the connect function

async function connectQueue() {
  try {
    connection = await amqp.connect('amqp://localhost:5672');
    channel = await connection.createChannel();
    console.log('connected');
    await channel.assertQueue(IMAGE_RESIZE_QUEUE);

    channel.consume(IMAGE_RESIZE_QUEUE, async (data) => {
      console.log(`${Buffer.from(data.content)}`);
      const content = JSON.parse(Buffer.from(data.content));

      if (!content || !Array.isArray(content) || content.length < 1) {
        // add verification that it's an array of string
        console.log('not doing anything');
        channel.ack(data);
        return;
      }

      const fullPaths = content;
      console.log(fullPaths);

      await Promise.all(
        fullPaths.map(async (fullFilePath) => {
          const fullPath = `../gmbts/uploads/${fullFilePath}`;
          const splittedPath = fullPath.split('/');
          const originalName = splittedPath[splittedPath.length - 1];
          const path = splittedPath.slice(0, splittedPath.length - 1).join('/');

          console.log({
            originalName,
            path,
            fullPath,
            splittedPath,
          });

          await minimize({ originalName: originalName, path });
        }),
      );

      channel.ack(data);
    });
  } catch (error) {
    console.log(error);
  }
}
