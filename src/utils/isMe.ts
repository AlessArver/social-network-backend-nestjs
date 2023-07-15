import { HttpException, HttpStatus } from '@nestjs/common';

export interface IIsMe<funcType> {
  meId: string;
  id: string;
  textError: string;
  func: () => funcType;
}
export const isMe = <funcType>({
  meId,
  id,
  textError,
  func,
}: IIsMe<funcType>) => {
  if (meId === id) {
    return func();
  } else {
    throw new HttpException(textError, HttpStatus.FORBIDDEN);
  }
};
