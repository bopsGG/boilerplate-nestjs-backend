import { Logger } from '@nestjs/common';

export function printLogDebug(message: string) {
  Logger.debug(message);
}

export function printLogError(message: string) {
  Logger.error(message);
}

export function printLogSuccess(message: string) {
  Logger.log(message);
}

export function printLogWarning(message: string) {
  Logger.warn(message);
}

export function printLogVerbose(message: string) {
  Logger.verbose(message);
}

export function printLogFatal(message: string) {
  Logger.fatal(message);
}
