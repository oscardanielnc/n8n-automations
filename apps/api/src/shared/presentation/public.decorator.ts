import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';
/** Skips the Access guard. Only for the container healthcheck, which returns nothing sensitive. */
export const Public = () => SetMetadata(IS_PUBLIC, true);
