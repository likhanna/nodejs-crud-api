import 'dotenv/config';

export const getPort = (): number => {
  return Number(process.env.PORT ?? 4000);
};
