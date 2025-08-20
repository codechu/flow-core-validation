/**
 * @fileoverview Tests for Flow Core Validation interfaces
 * 
 * These tests verify interface compliance and type safety, not implementation logic.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import type {
  IFlowValidator,
  IFlowSchema,
  IFlowValidationPipeline,
  IFlowConditionalValidator,
  IFlowValidationRule,
  IFlowValidationError,
  IFlowValidationResult,
  IFlowValidationContext,
  ValidatorInput,
  ValidatorOutput,
  FlowValidationFn,
  IFlowValidationBuilder
} from '../src/index.js';
import type { IFlowContext, FlowResult } from '@codechu/flow-core-seed';

// Import proper functions from Flow Core Seed
import { success, failure, flowError } from '@codechu/flow-core-seed';

// Test implementations for interface compliance

class TestValidator implements IFlowValidator<string, string> {
  readonly id = 'test-validator';
  readonly name = 'Test Validator';
  readonly description = 'A test validator';
  
  async validate(input: string, context: IFlowContext): Promise<FlowResult<string>> {
    return success(input.toUpperCase());
  }
}

class TestSchema implements IFlowSchema<object, object> {
  readonly id = 'test-schema';
  readonly name = 'Test Schema';
  readonly version = '1.0.0';
  
  async validateSchema(input: object, context: IFlowContext): Promise<FlowResult<object>> {
    return success(input);
  }
  
  getSchemaRules(): Record<string, unknown> {
    return { type: 'object', required: [] };
  }
}

class TestValidationPipeline implements IFlowValidationPipeline<string, string> {
  readonly id = 'test-pipeline';
  readonly name = 'Test Pipeline';
  private validators: IFlowValidator<any, any>[] = [];
  
  addValidator<TNext>(validator: IFlowValidator<string, TNext>): IFlowValidationPipeline<string, TNext> {
    this.validators.push(validator);
    return this as any;
  }
  
  async validatePipeline(input: string, context: IFlowContext): Promise<FlowResult<string>> {
    return success(input);
  }
  
  getPipelineInfo() {
    return {
      validatorCount: this.validators.length,
      validatorIds: this.validators.map(v => v.id)
    };
  }
}

class TestConditionalValidator implements IFlowConditionalValidator<string, string> {
  readonly id = 'test-conditional';
  readonly name = 'Test Conditional Validator';
  
  async shouldValidate(input: string, context: IFlowContext): Promise<boolean> {
    return input.length > 0;
  }
  
  async validateConditionally(input: string, context: IFlowContext): Promise<FlowResult<string>> {
    const should = await this.shouldValidate(input, context);
    if (should) {
      return success(input.trim());
    }
    return success(input);
  }
}

class TestValidationBuilder implements IFlowValidationBuilder<string> {
  private rules: string[] = [];
  
  required(): IFlowValidationBuilder<string> {
    this.rules.push('required');
    return this;
  }
  
  type(expectedType: string): IFlowValidationBuilder<string> {
    this.rules.push(`type:${expectedType}`);
    return this;
  }
  
  custom<TOutput>(validator: IFlowValidator<string, TOutput>): IFlowValidationBuilder<TOutput> {
    this.rules.push(`custom:${validator.id}`);
    return this as any;
  }
  
  build(): IFlowValidator<string> {
    return new TestValidator();
  }
}

// Mock context for testing
function createMockContext(): IFlowContext {
  return {
    data: new Map(),
    emit: async () => {},
    logger: {
      info: () => {},
      error: () => {},
      debug: () => {},
      warn: () => {}
    }
  };
}

function createMockValidationContext(): IFlowValidationContext {
  return {
    ...createMockContext(),
    validationData: new Map(),
    validationHistory: [],
    validationOptions: {
      stopOnFirstError: false,
      includeWarnings: true
    }
  };
}

describe('Flow Core Validation Interfaces', () => {
  describe('IFlowValidator', () => {
    it('should implement basic validator interface', async () => {
      const validator = new TestValidator();
      const context = createMockContext();
      
      assert.strictEqual(validator.id, 'test-validator');
      assert.strictEqual(validator.name, 'Test Validator');
      assert.strictEqual(validator.description, 'A test validator');
      
      const result = await validator.validate('hello', context);
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data, 'HELLO');
      }
    });
  });

  describe('IFlowSchema', () => {
    it('should implement schema validation interface', async () => {
      const schema = new TestSchema();
      const context = createMockContext();
      const input = { name: 'test' };
      
      assert.strictEqual(schema.id, 'test-schema');
      assert.strictEqual(schema.name, 'Test Schema');
      assert.strictEqual(schema.version, '1.0.0');
      
      const result = await schema.validateSchema(input, context);
      assert.strictEqual(result.success, true);
      
      const rules = schema.getSchemaRules();
      assert.strictEqual(typeof rules, 'object');
      assert.strictEqual(rules.type, 'object');
    });
  });

  describe('IFlowValidationPipeline', () => {
    it('should implement validation pipeline interface', async () => {
      const pipeline = new TestValidationPipeline();
      const validator = new TestValidator();
      const context = createMockContext();
      
      assert.strictEqual(pipeline.id, 'test-pipeline');
      assert.strictEqual(pipeline.name, 'Test Pipeline');
      
      pipeline.addValidator(validator);
      
      const info = pipeline.getPipelineInfo();
      assert.strictEqual(info.validatorCount, 1);
      assert.deepStrictEqual(info.validatorIds, ['test-validator']);
      
      const result = await pipeline.validatePipeline('test', context);
      assert.strictEqual(result.success, true);
    });
  });

  describe('IFlowConditionalValidator', () => {
    it('should implement conditional validation interface', async () => {
      const validator = new TestConditionalValidator();
      const context = createMockContext();
      
      assert.strictEqual(validator.id, 'test-conditional');
      assert.strictEqual(validator.name, 'Test Conditional Validator');
      
      const shouldValidateEmpty = await validator.shouldValidate('', context);
      assert.strictEqual(shouldValidateEmpty, false);
      
      const shouldValidateNonEmpty = await validator.shouldValidate('test', context);
      assert.strictEqual(shouldValidateNonEmpty, true);
      
      const result = await validator.validateConditionally(' test ', context);
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data, 'test');
      }
    });
  });

  describe('IFlowValidationBuilder', () => {
    it('should implement fluent validation builder interface', () => {
      const builder = new TestValidationBuilder();
      
      const validator = builder
        .required()
        .type('string')
        .build();
      
      assert.strictEqual(validator.id, 'test-validator');
      assert.strictEqual(validator.name, 'Test Validator');
    });
  });

  describe('Type Utilities', () => {
    it('should extract validator input/output types', () => {
      type TestInput = ValidatorInput<TestValidator>;
      type TestOutput = ValidatorOutput<TestValidator>;
      
      // Type-level tests (compilation validates these)
      const input: TestInput = 'test';
      const output: TestOutput = 'TEST';
      
      assert.strictEqual(typeof input, 'string');
      assert.strictEqual(typeof output, 'string');
    });

    it('should support functional validation approach', async () => {
      const validationFn: FlowValidationFn<string, string> = async (input, context) => {
        return success(input.toLowerCase());
      };
      
      const context = createMockValidationContext();
      const result = await validationFn('TEST', context);
      
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data, 'test');
      }
    });
  });

  describe('Error Interfaces', () => {
    it('should support validation rule interface', () => {
      const rule: IFlowValidationRule = {
        id: 'required-rule',
        name: 'Required Field',
        type: 'required',
        parameters: {},
        errorMessage: 'This field is required'
      };
      
      assert.strictEqual(rule.id, 'required-rule');
      assert.strictEqual(rule.type, 'required');
      assert.strictEqual(rule.errorMessage, 'This field is required');
    });

    it('should support validation error interface', () => {
      const error: IFlowValidationError = {
        code: 'VALIDATION_FAILED',
        message: 'Validation failed',
        field: 'email',
        expected: 'valid email format',
        actual: 'invalid-email',
        context: { validator: 'email-validator' }
      };
      
      assert.strictEqual(error.code, 'VALIDATION_FAILED');
      assert.strictEqual(error.field, 'email');
      assert.strictEqual(error.expected, 'valid email format');
    });

    it('should support validation result interface', () => {
      const result: IFlowValidationResult<string> = {
        isValid: true,
        data: 'validated-data',
        errors: [],
        warnings: [],
        metadata: {
          validatorId: 'test-validator',
          executionTime: 10,
          rulesApplied: ['required', 'type-check']
        }
      };
      
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.data, 'validated-data');
      assert.strictEqual(result.metadata.validatorId, 'test-validator');
      assert.strictEqual(result.metadata.rulesApplied.length, 2);
    });
  });

  describe('Validation Context', () => {
    it('should extend flow context with validation features', () => {
      const context = createMockValidationContext();
      
      assert.ok(context.validationData instanceof Map);
      assert.ok(Array.isArray(context.validationHistory));
      assert.strictEqual(typeof context.validationOptions, 'object');
      assert.strictEqual(context.validationOptions.stopOnFirstError, false);
      assert.strictEqual(context.validationOptions.includeWarnings, true);
      
      // Test validation history tracking
      context.validationHistory.push({
        validatorId: 'test',
        timestamp: Date.now(),
        result: 'success'
      });
      
      assert.strictEqual(context.validationHistory.length, 1);
      assert.strictEqual(context.validationHistory[0].result, 'success');
    });
  });
});