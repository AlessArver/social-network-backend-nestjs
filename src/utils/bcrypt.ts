import * as bcrypt from 'bcrypt';

export const encodePassword = async (password: string) => {
  const SALT = bcrypt.genSaltSync();
  return bcrypt.hash(password, SALT);
};

export const comparePasswords = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
