/**
 * @fileoverview Flow Core Validation - Pure validation abstractions
 * 
 * This package provides ONLY interfaces and types for validation in the Flow ecosystem.
 * No implementation logic - just pure abstractions that enable unlimited validation approaches.
 * 
 * Core Philosophy:
 * - Zero implementation logic
 * - Maximum flexibility through interfaces
 * - Result pattern for error handling
 * - Type-safe validation contracts
 */

import type { FlowResult, IFlowContext } from '@codechu/flow-core-seed';

/**
 * Universal validation interface for any data type
 */
export interface IFlowValidator<TInput, TOutput = TInput> {
  /** Unique identifier for this validator */
  readonly id: string;
  
  /** Human-readable name */
  readonly name: string;
  
  /** Optional description of validation rules */
  readonly description?: string;
  
  /**
   * Validate input and return result
   * @param input - Data to validate
   * @param context - Flow execution context
   * @returns Validation result with validated output or error
   */
  validate(input: TInput, context: IFlowContext): Promise<FlowResult<TOutput>>;
}

/**
 * Schema-based validation interface
 */
export interface IFlowSchema<TInput, TOutput = TInput> {
  /** Schema identifier */
  readonly id: string;
  
  /** Schema name */
  readonly name: string;
  
  /** Schema version for evolution */
  readonly version?: string;
  
  /**
   * Validate against schema
   * @param input - Data to validate
   * @param context - Flow execution context
   * @returns Validation result
   */
  validateSchema(input: TInput, context: IFlowContext): Promise<FlowResult<TOutput>>;
  
  /**
   * Get validation rules as metadata
   */
  getSchemaRules(): Record<string, unknown>;
}

/**
 * Validation pipeline interface for chaining validators
 */
export interface IFlowValidationPipeline<TInput, TOutput = TInput> {
  /** Pipeline identifier */
  readonly id: string;
  
  /** Pipeline name */
  readonly name: string;
  
  /**
   * Add validator to pipeline
   */
  addValidator<TNext>(validator: IFlowValidator<TOutput, TNext>): IFlowValidationPipeline<TInput, TNext>;
  
  /**
   * Execute validation pipeline
   * @param input - Data to validate
   * @param context - Flow execution context
   * @returns Final validation result
   */
  validatePipeline(input: TInput, context: IFlowContext): Promise<FlowResult<TOutput>>;
  
  /**
   * Get pipeline composition info
   */
  getPipelineInfo(): {
    validatorCount: number;
    validatorIds: string[];
  };
}

/**
 * Conditional validation interface
 */
export interface IFlowConditionalValidator<TInput, TOutput = TInput> {
  /** Validator identifier */
  readonly id: string;
  
  /** Validator name */
  readonly name: string;
  
  /**
   * Check if validation should be applied
   * @param input - Data to check
   * @param context - Flow execution context
   * @returns True if validation should be applied
   */
  shouldValidate(input: TInput, context: IFlowContext): Promise<boolean>;
  
  /**
   * Apply conditional validation
   * @param input - Data to validate
   * @param context - Flow execution context
   * @returns Validation result if applied, or passthrough
   */
  validateConditionally(input: TInput, context: IFlowContext): Promise<FlowResult<TOutput>>;
}

/**
 * Validation rule metadata interface
 */
export interface IFlowValidationRule {
  /** Rule identifier */
  readonly id: string;
  
  /** Rule name */
  readonly name: string;
  
  /** Rule type (required, format, range, etc.) */
  readonly type: string;
  
  /** Rule parameters */
  readonly parameters: Record<string, unknown>;
  
  /** Optional error message template */
  readonly errorMessage?: string;
}

/**
 * Validation error details interface
 */
export interface IFlowValidationError {
  /** Error code for categorization */
  readonly code: string;
  
  /** Human-readable error message */
  readonly message: string;
  
  /** Field or path that failed validation */
  readonly field?: string;
  
  /** Expected value or format */
  readonly expected?: unknown;
  
  /** Actual value that failed */
  readonly actual?: unknown;
  
  /** Validation rule that was violated */
  readonly rule?: IFlowValidationRule;
  
  /** Additional context data */
  readonly context?: Record<string, unknown>;
}

/**
 * Validation result metadata interface
 */
export interface IFlowValidationResult<TOutput> {
  /** Validation success status */
  readonly isValid: boolean;
  
  /** Validated output data (if successful) */
  readonly data?: TOutput;
  
  /** Validation errors (if any) */
  readonly errors: IFlowValidationError[];
  
  /** Validation warnings (non-blocking issues) */
  readonly warnings: IFlowValidationError[];
  
  /** Validation execution metadata */
  readonly metadata: {
    validatorId: string;
    executionTime?: number;
    rulesApplied: string[];
  };
}

/**
 * Validation context interface for shared validation state
 */
export interface IFlowValidationContext extends IFlowContext {
  /** Validation-specific data sharing */
  validationData: Map<string, unknown>;
  
  /** Validation history for pipeline tracking */
  validationHistory: Array<{
    validatorId: string;
    timestamp: number;
    result: 'success' | 'failure' | 'warning';
  }>;
  
  /** Validation options and flags */
  validationOptions: {
    stopOnFirstError: boolean;
    includeWarnings: boolean;
    timeoutMs?: number;
  };
}

/**
 * Type-safe validation helper types
 */

/** Extract input type from validator */
export type ValidatorInput<T> = T extends IFlowValidator<infer I, any> ? I : never;

/** Extract output type from validator */
export type ValidatorOutput<T> = T extends IFlowValidator<any, infer O> ? O : never;

/** Validation function type for functional approach */
export type FlowValidationFn<TInput, TOutput = TInput> = (
  input: TInput,
  context: IFlowValidationContext
) => Promise<FlowResult<TOutput>>;

/**
 * Validation builder interface for fluent API support
 */
export interface IFlowValidationBuilder<TInput> {
  /**
   * Add required field validation
   */
  required(): IFlowValidationBuilder<TInput>;
  
  /**
   * Add type validation
   */
  type(expectedType: string): IFlowValidationBuilder<TInput>;
  
  /**
   * Add custom validator
   */
  custom<TOutput>(validator: IFlowValidator<TInput, TOutput>): IFlowValidationBuilder<TOutput>;
  
  /**
   * Build final validator
   */
  build(): IFlowValidator<TInput>;
}

// Re-export Flow Core Seed types for convenience
export type { FlowResult, IFlowContext } from '@codechu/flow-core-seed';