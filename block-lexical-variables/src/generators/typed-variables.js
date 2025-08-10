'use strict';

import * as Shared from '../shared.js';
import * as Blockly from 'blockly/core';
import * as pkg from 'blockly/javascript';

if (pkg) {
  const {javascriptGenerator, Order} = pkg;

  /**
   * Generate code for typed global variable declaration.
   * @param {Blockly.Block} block The block to generate code for.
   * @param {Object} generator The code generator.
   * @return {string} The generated code.
   */
  javascriptGenerator.forBlock['typed_global_declaration'] = function(block, generator) {
    const varName = getVariableName(block.getFieldValue('NAME'));
    const varType = block.getFieldValue('TYPE');
    const value = generator.valueToCode(block, 'DECL', Order.ASSIGNMENT) || getDefaultValue(varType);
    
    // Generate TypeScript-style code
    return `declare global {\n  var ${varName}: ${varType} = ${value};\n}\n`;
  };

  /**
   * Generate code for typed local variable declaration statement.
   * @param {Blockly.Block} block The block to generate code for.
   * @param {Object} generator The code generator.
   * @return {string} The generated code.
   */
  javascriptGenerator.forBlock['typed_local_declaration_statement'] = function(block, generator) {
    const varName = getVariableName(block.getFieldValue('VAR'));
    const varType = block.getFieldValue('TYPE');
    const value = generator.valueToCode(block, 'DECL', Order.NONE) || getDefaultValue(varType);
    
    let code = '{\n  let ';
    code += (Shared.usePrefixInCode ? 'local_' : '') + varName;
    code += `: ${varType} = ${value};\n`;
    code += generator.statementToCode(block, 'DO');
    code += '}\n';
    return code;
  };

  /**
   * Generate code for typed variable getter.
   * @param {Blockly.Block} block The block to generate code for.
   * @param {Object} generator The code generator.
   * @return {Array} The generated code and order.
   */
  javascriptGenerator.forBlock['typed_lexical_variable_get'] = function(block, generator) {
    const code = getVariableName(block.getFieldValue('VAR'));
    return [code, Order.ATOMIC];
  };

  /**
   * Generate code for typed variable setter.
   * @param {Blockly.Block} block The block to generate code for.
   * @param {Object} generator The code generator.
   * @return {string} The generated code.
   */
  javascriptGenerator.forBlock['typed_lexical_variable_set'] = function(block, generator) {
    const argument0 = generator.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || '0';
    const varName = getVariableName(block.getFieldValue('VAR'));
    return varName + ' = ' + argument0 + ';\n';
  };

  /**
   * Generate variable name with proper prefixing.
   * @param {string} name The variable name.
   * @return {string} The processed variable name.
   */
  function getVariableName(name) {
    const pair = Shared.unprefixName(name);
    const prefix = pair[0];
    const unprefixedName = pair[1];
    if (prefix === Blockly.Msg.LANG_VARIABLES_GLOBAL_PREFIX ||
        prefix === Shared.GLOBAL_KEYWORD) {
      return unprefixedName;
    } else {
      return (Shared.possiblyPrefixGeneratedVarName(prefix))(unprefixedName);
    }
  }

  /**
   * Get default value for a type.
   * @param {string} type The type.
   * @return {string} The default value.
   */
  function getDefaultValue(type) {
    switch (type) {
      case 'number':
      case 'int':
      case 'float':
      case 'double':
        return '0';
      case 'string':
      case 'char':
      case 'char*':
        return '""';
      case 'boolean':
      case 'bool':
        return 'false';
      case 'array':
      case 'number[]':
      case 'string[]':
      case 'boolean[]':
        return '[]';
      case 'object':
        return '{}';
      case 'function':
        return '() => {}';
      case 'void':
        return '';
      default:
        return 'null';
    }
  }
}

// C Generator
if (typeof Blockly.C !== 'undefined') {
  const cGenerator = Blockly.C;

  /**
   * Generate C code for typed global variable declaration.
   * @param {Blockly.Block} block The block to generate code for.
   * @param {Object} generator The code generator.
   * @return {string} The generated code.
   */
  cGenerator.forBlock['typed_global_declaration'] = function(block, generator) {
    const varName = getVariableName(block.getFieldValue('NAME'));
    const varType = block.getFieldValue('TYPE');
    const value = generator.valueToCode(block, 'DECL', Order.ASSIGNMENT) || getCDefaultValue(varType);
    
    return `${varType} ${varName} = ${value};\n`;
  };

  /**
   * Generate C code for typed local variable declaration statement.
   * @param {Blockly.Block} block The block to generate code for.
   * @param {Object} generator The code generator.
   * @return {string} The generated code.
   */
  cGenerator.forBlock['typed_local_declaration_statement'] = function(block, generator) {
    const varName = getVariableName(block.getFieldValue('VAR'));
    const varType = block.getFieldValue('TYPE');
    const value = generator.valueToCode(block, 'DECL', Order.NONE) || getCDefaultValue(varType);
    
    let code = '{\n  ';
    code += `${varType} ${varName} = ${value};\n`;
    code += generator.statementToCode(block, 'DO');
    code += '}\n';
    return code;
  };

  /**
   * Generate C code for typed variable getter.
   * @param {Blockly.Block} block The block to generate code for.
   * @param {Object} generator The code generator.
   * @return {Array} The generated code and order.
   */
  cGenerator.forBlock['typed_lexical_variable_get'] = function(block, generator) {
    const code = getVariableName(block.getFieldValue('VAR'));
    return [code, Order.ATOMIC];
  };

  /**
   * Generate C code for typed variable setter.
   * @param {Blockly.Block} block The block to generate code for.
   * @param {Object} generator The code generator.
   * @return {string} The generated code.
   */
  cGenerator.forBlock['typed_lexical_variable_set'] = function(block, generator) {
    const argument0 = generator.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || '0';
    const varName = getVariableName(block.getFieldValue('VAR'));
    return varName + ' = ' + argument0 + ';\n';
  };

  /**
   * Get default value for C types.
   * @param {string} type The C type.
   * @return {string} The default value.
   */
  function getCDefaultValue(type) {
    switch (type) {
      case 'int':
      case 'float':
      case 'double':
        return '0';
      case 'char':
        return "'\\0'";
      case 'char*':
        return '""';
      case 'bool':
        return 'false';
      case 'void':
        return '';
      case 'int*':
      case 'float*':
        return 'NULL';
      default:
        return '0';
    }
  }
}

// TypeScript Generator
if (typeof Blockly.TypeScript !== 'undefined') {
  const typescriptGenerator = Blockly.TypeScript;

  /**
   * Generate TypeScript code for typed global variable declaration.
   * @param {Blockly.Block} block The block to generate code for.
   * @param {Object} generator The code generator.
   * @return {string} The generated code.
   */
  typescriptGenerator.forBlock['typed_global_declaration'] = function(block, generator) {
    const varName = getVariableName(block.getFieldValue('NAME'));
    const varType = block.getFieldValue('TYPE');
    const value = generator.valueToCode(block, 'DECL', Order.ASSIGNMENT) || getDefaultValue(varType);
    
    return `declare global {\n  var ${varName}: ${varType} = ${value};\n}\n`;
  };

  /**
   * Generate TypeScript code for typed local variable declaration statement.
   * @param {Blockly.Block} block The block to generate code for.
   * @param {Object} generator The code generator.
   * @return {string} The generated code.
   */
  typescriptGenerator.forBlock['typed_local_declaration_statement'] = function(block, generator) {
    const varName = getVariableName(block.getFieldValue('VAR'));
    const varType = block.getFieldValue('TYPE');
    const value = generator.valueToCode(block, 'DECL', Order.NONE) || getDefaultValue(varType);
    
    let code = '{\n  let ';
    code += (Shared.usePrefixInCode ? 'local_' : '') + varName;
    code += `: ${varType} = ${value};\n`;
    code += generator.statementToCode(block, 'DO');
    code += '}\n';
    return code;
  };

  /**
   * Generate TypeScript code for typed variable getter.
   * @param {Blockly.Block} block The block to generate code for.
   * @param {Object} generator The code generator.
   * @return {Array} The generated code and order.
   */
  typescriptGenerator.forBlock['typed_lexical_variable_get'] = function(block, generator) {
    const code = getVariableName(block.getFieldValue('VAR'));
    return [code, Order.ATOMIC];
  };

  /**
   * Generate TypeScript code for typed variable setter.
   * @param {Blockly.Block} block The block to generate code for.
   * @param {Object} generator The code generator.
   * @return {string} The generated code.
   */
  typescriptGenerator.forBlock['typed_lexical_variable_set'] = function(block, generator) {
    const argument0 = generator.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || '0';
    const varName = getVariableName(block.getFieldValue('VAR'));
    return varName + ' = ' + argument0 + ';\n';
  };
}
