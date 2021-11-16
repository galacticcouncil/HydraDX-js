import { RegistryError } from '@polkadot/types/types/registry';
import { HydraApiPromise } from '../types';

export const ErrorName = {
  BaseError: 'BaseError',
  ApiInstanceError: 'ApiInstanceError',
  ApiCallError: 'ApiCallError',
  ApiBaseError: 'ApiBaseError',
} as const;

type ErrorName = typeof ErrorName[keyof typeof ErrorName];

class BaseError extends Error {
  isOperational: boolean;
  call: string;

  constructor(
    section: string,
    description: string,
    name: string,
    isOperational: boolean
  ) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.call = section;
    this.isOperational = isOperational;
    Error.captureStackTrace(this);
  }
}

export class ApiInstanceError extends BaseError {
  constructor(
    call: string,
    description = 'API instance is not available',
    name = ErrorName.ApiInstanceError,
    isOperational = true
  ) {
    super(call, description, name, isOperational);
  }
}

export class ApiBaseError extends BaseError {
  constructor(
    call: string,
    description = 'API instance is not available',
    name = ErrorName.ApiBaseError,
    isOperational = true
  ) {
    super(call, description, name, isOperational);
  }
}

export class ApiCallError extends BaseError {
  dispatchError: any;
  registryErrMessage: string;
  registryErrName: string;
  registryErrDoc: string;
  registryErrSection: string;

  constructor(
    call: string,
    dispatchError: any,
    api: HydraApiPromise,
    description = 'API call has not been successful.',
    name = ErrorName.ApiCallError,
    isOperational = true
  ) {
    super(call, description, name, isOperational);

    this.dispatchError = dispatchError;
    this.registryErrMessage = '';
    this.registryErrDoc = '';
    this.registryErrSection = '';
    this.registryErrName = '';

    this.parseRegistryError(api);
  }

  parseRegistryError(api: HydraApiPromise) {
    if (this.dispatchError.isModule) {
      const { docs, section, name } = api.registry.findMetaError(
        this.dispatchError.asModule
      ) as RegistryError;

      this.registryErrSection = section;
      this.registryErrDoc = docs.join(' ');
      this.registryErrName = name;
    } else {
      this.registryErrMessage = this.dispatchError.toString();
    }
  }
}
