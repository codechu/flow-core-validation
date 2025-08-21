# 🛡️ Flow Core Validation

[![npm version](https://badge.fury.io/js/@codechu%2Fflow-core-validation.svg)](https://badge.fury.io/js/@codechu%2Fflow-core-validation)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Pure validation abstractions for the Flow ecosystem** - Zero implementation, maximum flexibility through interfaces.

## 🎯 **Core Philosophy**

Flow Core Validation provides **ONLY interfaces and types** - no implementation logic. This enables unlimited validation approaches while maintaining type safety and Flow ecosystem compatibility.

```typescript
import { IFlowValidator, FlowResult } from '@codechu/flow-core-validation';
import { IFlowContext, success, failure } from '@codechu/flow-core-seed';

// Your implementation, your rules - just follow the interface
class EmailValidator implements IFlowValidator<string, string> {
  readonly id = 'email-validator';
  readonly name = 'Email Validation';
  
  async validate(input: string, context: IFlowContext): Promise<FlowResult<string>> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input) 
      ? success(input.toLowerCase())
      : failure(flowError('INVALID_EMAIL', 'Invalid email format'));
  }
}
```

## 📦 **Installation**

```bash
npm install @codechu/flow-core-validation
```

## 🏗️ **Core Interfaces**

### **IFlowValidator<TInput, TOutput>**
Universal validation interface for any data type:

```typescript
interface IFlowValidator<TInput, TOutput = TInput> {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  
  validate(input: TInput, context: IFlowContext): Promise<FlowResult<TOutput>>;
}
```

### **IFlowSchema<TInput, TOutput>**
Schema-based validation with metadata:

```typescript
interface IFlowSchema<TInput, TOutput = TInput> {
  readonly id: string;
  readonly name: string;
  readonly version?: string;
  
  validateSchema(input: TInput, context: IFlowContext): Promise<FlowResult<TOutput>>;
  getSchemaRules(): Record<string, unknown>;
}
```

### **IFlowValidationPipeline<TInput, TOutput>**
Chain validators together:

```typescript
interface IFlowValidationPipeline<TInput, TOutput = TInput> {
  readonly id: string;
  readonly name: string;
  
  addValidator<TNext>(validator: IFlowValidator<TOutput, TNext>): IFlowValidationPipeline<TInput, TNext>;
  validatePipeline(input: TInput, context: IFlowContext): Promise<FlowResult<TOutput>>;
  getPipelineInfo(): { validatorCount: number; validatorIds: string[]; };
}
```

### **IFlowConditionalValidator<TInput, TOutput>**
Apply validation conditionally:

```typescript
interface IFlowConditionalValidator<TInput, TOutput = TInput> {
  readonly id: string;
  readonly name: string;
  
  shouldValidate(input: TInput, context: IFlowContext): Promise<boolean>;
  validateConditionally(input: TInput, context: IFlowContext): Promise<FlowResult<TOutput>>;
}
```

## 🛠️ **Usage Examples**

### **Basic Validator Implementation**

```typescript
import { IFlowValidator, FlowResult } from '@codechu/flow-core-validation';
import { success, failure, flowError } from '@codechu/flow-core-seed';

class NumberRangeValidator implements IFlowValidator<number, number> {
  constructor(private min: number, private max: number) {}
  
  readonly id = `range-${this.min}-${this.max}`;
  readonly name = `Number Range Validator (${this.min}-${this.max})`;
  
  async validate(input: number, context: IFlowContext): Promise<FlowResult<number>> {
    if (input >= this.min && input <= this.max) {
      return success(input);
    }
    
    return failure(flowError(
      'OUT_OF_RANGE',
      `Number ${input} not in range ${this.min}-${this.max}`,
      new RangeError(`Expected ${this.min}-${this.max}, got ${input}`)
    ));
  }
}
```

### **Schema Validation**

```typescript
import { IFlowSchema } from '@codechu/flow-core-validation';

interface UserData {
  name: string;
  email: string;
  age: number;
}

class UserSchema implements IFlowSchema<unknown, UserData> {
  readonly id = 'user-schema';
  readonly name = 'User Data Schema';
  readonly version = '1.0.0';
  
  async validateSchema(input: unknown, context: IFlowContext): Promise<FlowResult<UserData>> {
    // Your schema validation logic here
    // Could use Zod, Joi, or custom validation
    return success(input as UserData);
  }
  
  getSchemaRules() {
    return {
      type: 'object',
      properties: {
        name: { type: 'string', required: true },
        email: { type: 'string', format: 'email', required: true },
        age: { type: 'number', minimum: 0, maximum: 150 }
      }
    };
  }
}
```

### **Validation Pipeline**

```typescript
import { IFlowValidationPipeline } from '@codechu/flow-core-validation';

class StringValidationPipeline implements IFlowValidationPipeline<string, string> {
  readonly id = 'string-pipeline';
  readonly name = 'String Validation Pipeline';
  private validators: IFlowValidator<any, any>[] = [];
  
  addValidator<TNext>(validator: IFlowValidator<string, TNext>) {
    this.validators.push(validator);
    return this as any; // Type casting for chaining
  }
  
  async validatePipeline(input: string, context: IFlowContext): Promise<FlowResult<string>> {
    let current: any = input;
    
    for (const validator of this.validators) {
      const result = await validator.validate(current, context);
      if (!result.isSuccess) {
        return result;
      }
      current = result.value;
    }
    
    return success(current);
  }
  
  getPipelineInfo() {
    return {
      validatorCount: this.validators.length,
      validatorIds: this.validators.map(v => v.id)
    };
  }
}

// Usage
const pipeline = new StringValidationPipeline()
  .addValidator(new TrimValidator())
  .addValidator(new EmailValidator())
  .addValidator(new LowercaseValidator());
```

## 🏗️ **Advanced Features**

### **Conditional Validation**

```typescript
class ConditionalEmailValidator implements IFlowConditionalValidator<string, string> {
  readonly id = 'conditional-email';
  readonly name = 'Conditional Email Validator';
  
  async shouldValidate(input: string, context: IFlowContext): Promise<boolean> {
    // Only validate if input looks like it might be an email
    return input.includes('@');
  }
  
  async validateConditionally(input: string, context: IFlowContext): Promise<FlowResult<string>> {
    if (await this.shouldValidate(input, context)) {
      return new EmailValidator().validate(input, context);
    }
    return success(input); // Pass through unchanged
  }
}
```

### **Validation Context with History**

```typescript
import { IFlowValidationContext } from '@codechu/flow-core-validation';

// Enhanced context with validation tracking
const validationContext: IFlowValidationContext = {
  ...flowContext,
  validationData: new Map([
    ['skipWarnings', true],
    ['strictMode', false]
  ]),
  validationHistory: [],
  validationOptions: {
    stopOnFirstError: true,
    includeWarnings: false,
    timeoutMs: 5000
  }
};
```

### **Type-Safe Utilities**

```typescript
import { ValidatorInput, ValidatorOutput, FlowValidationFn } from '@codechu/flow-core-validation';

// Extract types from validators
type EmailInput = ValidatorInput<EmailValidator>; // string
type EmailOutput = ValidatorOutput<EmailValidator>; // string

// Functional validation approach
const validateAge: FlowValidationFn<number, number> = async (age, context) => {
  return age >= 18 && age <= 120
    ? success(age)
    : failure(flowError('INVALID_AGE', 'Age must be 18-120'));
};
```

## 🧪 **Implementation Packages**

Flow Core Validation is **interface-only**. Use these implementation packages:

- **`@codechu/flow-joi-validation`** - Joi schema validation
- **`@codechu/flow-zod-validation`** - Zod schema validation  
- **`@codechu/flow-yup-validation`** - Yup schema validation
- **`@codechu/flow-custom-validation`** - Custom validation utilities

```typescript
// Example with Joi implementation
import { JoiValidator } from '@codechu/flow-joi-validation';
import * as Joi from 'joi';

const userValidator = new JoiValidator(
  Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    age: Joi.number().min(18).max(120)
  })
);
```

## ✨ **Key Benefits**

1. **🎯 Pure Abstractions** - Zero implementation logic, maximum flexibility
2. **🔗 Flow Integration** - Seamless integration with Flow ecosystem
3. **⚡ Type Safety** - Full TypeScript support with generics
4. **🧩 Composability** - Chain, conditional, and pipeline validation
5. **📏 Result Pattern** - Consistent error handling without exceptions
6. **🔒 Immutable Contracts** - Interfaces will never change
7. **🚀 Performance** - Minimal overhead, your implementation rules

## 🔗 **Flow Ecosystem Integration**

```typescript
import { IFlowStep } from '@codechu/flow-core-seed';
import { IFlowValidator } from '@codechu/flow-core-validation';

// Validation as a Flow Step
class ValidationStep<T> implements IFlowStep<T, T> {
  constructor(private validator: IFlowValidator<T>) {}
  
  readonly id = `validation-${this.validator.id}`;
  readonly name = `Validation: ${this.validator.name}`;
  
  async process(input: T, context: IFlowContext): Promise<FlowResult<T>> {
    return this.validator.validate(input, context);
  }
}
```

## 📊 **Package Stats**

- **Dependencies**: 1 (`@codechu/flow-core-seed`)
- **Bundle Size**: ~3KB (interfaces only)
- **TypeScript**: Full declaration support
- **Node.js**: >=18.0.0
- **License**: MIT

## 🌊 **Flow Ecosystem**

Flow Core Validation is part of the Flow ecosystem:

- **`@codechu/flow-core-seed`** - Foundation interfaces ✅
- **`@codechu/flow-core-validation`** - Validation abstractions ✅
- **`@codechu/flow-core-container`** - IoC container interfaces
- **`@codechu/flow-core-config`** - Configuration management
- **`@codechu/flow-core-events`** - Event system abstractions
- **`@codechu/flow-core-workflow`** - Workflow orchestration

## 🏢 **Credits**

**Company**: Codechu  
**Author**: Obarlik  
**License**: MIT

---

🛡️→⚡ **Pure validation interfaces that grow with your needs**// Test deploy key bypass fix
// Final automated release test
