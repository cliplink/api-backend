import { type ValidationPipeOptions } from '@nestjs/common';

export const getValidationPipeParams = (showError = false): ValidationPipeOptions => ({
  disableErrorMessages: !showError,
  whitelist: true,
  transform: true,
  stopAtFirstError: true,
});
