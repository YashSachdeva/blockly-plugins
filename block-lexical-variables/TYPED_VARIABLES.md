# Statically Typed Variable Support

This document describes the new statically typed variable support added to the Blockly Lexical Variables plugin. This feature allows you to declare variables with specific types and generate type-safe code for languages like C and TypeScript.

## Overview

The typed variable support extends the existing lexical variable functionality with:

- **Type declarations**: Variables can be declared with specific types (number, string, boolean, etc.)
- **Type checking**: Runtime type checking to catch type mismatches
- **Multi-language support**: Code generation for C, TypeScript, and JavaScript
- **Type inference**: Automatic type detection for compatible assignments

## New Block Types

### Typed Global Variable Declaration
**Block type: 'typed_global_declaration'**

Declares a global variable with a specific type. The variable is accessible throughout the entire program.

```typescript
// TypeScript output
declare global {
  var counter: number = 0;
}

// C output
int counter = 0;
```

### Typed Local Variable Declaration
**Block type: 'typed_local_declaration_statement'**

Declares a local variable with a specific type within a scope.

```typescript
// TypeScript output
{
  let name: string = "John";
  // ... rest of scope
}

// C output
{
  char* name = "John";
  // ... rest of scope
}
```

### Typed Variable Getter
**Block type: 'typed_lexical_variable_get'**

Gets the value of a typed variable. The type information is preserved for type checking.

### Typed Variable Setter
**Block type: 'typed_lexical_variable_set'**

Sets the value of a typed variable. Type checking ensures the assigned value is compatible.

## Supported Types

### TypeScript/JavaScript Types
- `any` - Any type (no type checking)
- `number` - Numeric values
- `string` - Text values
- `boolean` - True/false values
- `array` - Generic arrays
- `number[]` - Number arrays
- `string[]` - String arrays
- `boolean[]` - Boolean arrays
- `object` - Object values
- `function` - Function values
- `void` - No return value
- `Promise<any>` - Generic promises
- `Promise<number>` - Number promises
- `Promise<string>` - String promises
- `Promise<boolean>` - Boolean promises

### C Types
- `int` - Integer values
- `float` - Single precision floating point
- `double` - Double precision floating point
- `char` - Character values
- `char*` - String pointers
- `void` - No return value
- `bool` - Boolean values
- `int*` - Integer pointers
- `float*` - Float pointers

## Usage

### Basic Setup

```javascript
import * as Blockly from 'blockly';
import {LexicalVariablesPlugin} from '@mit-app-inventor/blockly-block-lexical-variables';

const workspace = Blockly.inject('blocklyDiv', options);

// Initialize the plugin
LexicalVariablesPlugin.init(workspace);

// Create a type manager for type checking
const typeManager = new LexicalVariablesPlugin.TypeManager(workspace);
```

### Creating Typed Variables

```javascript
// Create a typed global variable block
const globalBlock = workspace.newBlock('typed_global_declaration');
globalBlock.setFieldValue('counter', 'NAME');
globalBlock.setFieldValue('number', 'TYPE');

// Create a typed local variable block
const localBlock = workspace.newBlock('typed_local_declaration_statement');
localBlock.setFieldValue('name', 'VAR');
localBlock.setFieldValue('string', 'TYPE');
```

### Type Checking

```javascript
// Check for type errors in the workspace
const errors = typeManager.checkTypeErrors();

if (errors.length > 0) {
  console.log('Type errors found:');
  errors.forEach(error => {
    console.log(`- ${error.message}`);
  });
}
```

### Code Generation

```javascript
// Generate TypeScript code
const typescriptCode = Blockly.JavaScript.workspaceToCode(workspace);

// Generate C code (requires C generator)
const cCode = Blockly.C.workspaceToCode(workspace);
```

## Type Manager API

The `TypeManager` class provides comprehensive type management capabilities:

### Methods

- `registerVariable(name, type, scope)` - Register a variable with its type
- `getVariableType(name)` - Get the type of a variable
- `isVariableDeclared(name)` - Check if a variable is declared
- `areTypesCompatible(targetType, sourceType)` - Check type compatibility
- `checkTypeErrors()` - Check for type errors in the workspace
- `getTypeErrors()` - Get all type errors
- `clearTypeErrors()` - Clear all type errors
- `getVariableTypeSummary()` - Get summary of all variable types
- `reset()` - Reset the type manager
- `exportTypeInfo()` - Export type information to JSON
- `importTypeInfo(jsonString)` - Import type information from JSON

### Example

```javascript
const typeManager = new LexicalVariablesPlugin.TypeManager(workspace);

// Register variables
typeManager.registerVariable('counter', 'number', 'global');
typeManager.registerVariable('name', 'string', 'local');

// Check type compatibility
const compatible = typeManager.areTypesCompatible('number', 'int'); // true
const incompatible = typeManager.areTypesCompatible('string', 'number'); // false

// Check for errors
const errors = typeManager.checkTypeErrors();
```

## Type Compatibility Rules

The type system supports the following compatibility rules:

1. **Exact matches**: Types that are identical are compatible
2. **Any type**: The `any` type is compatible with all types
3. **Numeric types**: `number`, `int`, `float`, and `double` are compatible with each other
4. **Array types**: Arrays are compatible if their base types are compatible
5. **Pointer types**: Pointers are compatible if their base types are compatible (C only)

## Error Handling

Type errors are reported with the following information:

- **Block**: The block that caused the error
- **Message**: A descriptive error message
- **Severity**: The severity level ('error' or 'warning')

Common error types:

- Type mismatches in assignments
- Undeclared variables
- Duplicate variable declarations
- Incompatible type assignments

## Integration with Existing Blocks

The typed variable blocks are designed to work alongside the existing lexical variable blocks. You can:

- Mix typed and untyped variables in the same workspace
- Use typed variables in existing control structures
- Maintain backward compatibility with existing code

## Demo

A demo is available at `test/typed-variables-demo.html` that showcases:

- Creating typed variables
- Type checking
- Code generation for different languages
- Error reporting

## Future Enhancements

Planned features for future releases:

- **Type inference**: Automatic type detection from assignments
- **Generic types**: Support for generic type parameters
- **Union types**: Support for union types (e.g., `string | number`)
- **Interface types**: Support for interface definitions
- **Advanced type checking**: More sophisticated type compatibility rules
- **IDE integration**: Better integration with development environments

## Contributing

To contribute to the typed variable support:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit a pull request

## License

This feature is released under the Apache 2.0 License, same as the main plugin.
