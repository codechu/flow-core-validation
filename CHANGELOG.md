# Changelog

All notable changes to Flow Core Validation will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-20

### Added
- 🛡️ **Initial release of Flow Core Validation**
- 🔧 **8 pure validation interfaces**: `IFlowValidator`, `IFlowSchema`, `IFlowValidationPipeline`, `IFlowConditionalValidator`, plus error/result/context interfaces
- ⚡ **Zero implementation logic** - Pure abstractions only
- 🧩 **Complete TypeScript support** with full generics and strict mode
- 📦 **Dual package support** - Both CommonJS and ES Modules
- 🎯 **Single dependency** - Only `@codechu/flow-core-seed`
- ✅ **Comprehensive test suite** - 15+ tests covering all interfaces
- 📚 **Complete documentation** with examples and implementation guides
- 🚀 **Ultra-minimal design** - ~3KB package size
- 🔒 **Interface immutability guarantee** - Core will never change

### Technical Details
- **Package size**: ~3KB (interfaces only)
- **TypeScript**: Full declaration files (.d.ts/.d.mts)
- **Node.js**: >=18.0.0 support
- **Build system**: TSUP with dual format output
- **Test runner**: Node.js built-in test runner

### Core Interfaces
- **IFlowValidator<TInput, TOutput>**: Universal validation interface
- **IFlowSchema<TInput, TOutput>**: Schema-based validation with metadata
- **IFlowValidationPipeline<TInput, TOutput>**: Chain validators together
- **IFlowConditionalValidator<TInput, TOutput>**: Apply validation conditionally
- **IFlowValidationRule**: Validation rule metadata
- **IFlowValidationError**: Detailed validation error information
- **IFlowValidationResult<TOutput>**: Rich validation result metadata
- **IFlowValidationContext**: Extended context with validation features

### Type Utilities
- **ValidatorInput<T>**: Extract input type from validator
- **ValidatorOutput<T>**: Extract output type from validator
- **FlowValidationFn<TInput, TOutput>**: Functional validation approach
- **IFlowValidationBuilder<TInput>**: Fluent validation builder interface

### Design Principles
- **Pure abstractions** - Zero implementation logic, maximum flexibility
- **Result pattern integration** - Consistent error handling with Flow Core Seed
- **Type-safe contracts** - Full TypeScript generic support
- **Composable architecture** - Pipeline, conditional, and builder patterns
- **Context-aware validation** - Rich execution context with history tracking
- **Implementation agnostic** - Support for Joi, Zod, Yup, custom validators

### Integration Features
- **Flow ecosystem compatibility** - Seamless integration with all Flow packages
- **Step-based validation** - Can be used directly as IFlowStep implementations
- **Context sharing** - Enhanced validation context extends IFlowContext
- **Error handling** - Consistent FlowResult pattern throughout
- **Observability** - Full validation history and metadata tracking

**Company**: Codechu  
**Author**: Obarlik  

Pure validation interfaces that grow with your needs 🛡️→⚡