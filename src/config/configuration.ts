const configuration = () => ({
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  PORT: parseInt(process.env.PORT, 10) || 3000,
});

export type Config = ReturnType<typeof configuration>;

export default configuration;
