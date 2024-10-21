import { validate } from 'uuid';

export const getAndValidateId = (url: string): string | null => {
  const id = url.split('/').at(-1);

  if (!id || !validate(id)) {
    return null;
  }
  console.log('%c getAndValidateID.ts:9 id', 'color: #007acc;', id);
  return id;
};
