'use strict';

import * as Blockly from 'blockly/core';

/**
 * Manages type information for variables across the workspace.
 * Provides type checking and type inference capabilities.
 */
export class TypeManager {
  /**
   * Constructor for the type manager.
   * @param {Blockly.Workspace} workspace The workspace to manage types for.
   */
  constructor(workspace) {
    this.workspace = workspace;
    this.variableTypes = new Map(); // Map of variable name to type
    this.blockTypes = new Map(); // Map of block ID to type information
    this.typeErrors = []; // Array of type errors
  }

  /**
   * Register a variable with its type.
   * @param {string} variableName The name of the variable.
   * @param {string} type The type of the variable.
   * @param {string} scope The scope of the variable ('global' or 'local').
   */
  registerVariable(variableName, type, scope = 'local') {
    this.variableTypes.set(variableName, {
      type: type,
      scope: scope,
      declared: true
    });
  }

  /**
   * Get the type of a variable.
   * @param {string} variableName The name of the variable.
   * @return {string|null} The type of the variable, or null if not found.
   */
  getVariableType(variableName) {
    const varInfo = this.variableTypes.get(variableName);
    return varInfo ? varInfo.type : null;
  }

  /**
   * Check if a variable is declared.
   * @param {string} variableName The name of the variable.
   * @return {boolean} True if the variable is declared.
   */
  isVariableDeclared(variableName) {
    return this.variableTypes.has(variableName);
  }

  /**
   * Register type information for a block.
   * @param {string} blockId The ID of the block.
   * @param {Object} typeInfo The type information for the block.
   */
  registerBlockType(blockId, typeInfo) {
    this.blockTypes.set(blockId, typeInfo);
  }

  /**
   * Get type information for a block.
   * @param {string} blockId The ID of the block.
   * @return {Object|null} The type information for the block, or null if not found.
   */
  getBlockType(blockId) {
    return this.blockTypes.get(blockId) || null;
  }

  /**
   * Check if two types are compatible for assignment.
   * @param {string} targetType The target type.
   * @param {string} sourceType The source type.
   * @return {boolean} True if the types are compatible.
   */
  areTypesCompatible(targetType, sourceType) {
    // Handle 'any' type
    if (targetType === 'any' || sourceType === 'any') {
      return true;
    }

    // Handle exact matches
    if (targetType === sourceType) {
      return true;
    }

    // Handle numeric types
    const numericTypes = ['number', 'int', 'float', 'double'];
    if (numericTypes.includes(targetType) && numericTypes.includes(sourceType)) {
      return true;
    }

    // Handle array types
    if (targetType.endsWith('[]') && sourceType.endsWith('[]')) {
      const targetBase = targetType.slice(0, -2);
      const sourceBase = sourceType.slice(0, -2);
      return this.areTypesCompatible(targetBase, sourceBase);
    }

    // Handle pointer types (for C)
    if (targetType.endsWith('*') && sourceType.endsWith('*')) {
      const targetBase = targetType.slice(0, -1);
      const sourceBase = sourceType.slice(0, -1);
      return this.areTypesCompatible(targetBase, sourceBase);
    }

    return false;
  }

  /**
   * Check for type errors in the workspace.
   * @return {Array} Array of type errors found.
   */
  checkTypeErrors() {
    this.typeErrors = [];
    const blocks = this.workspace.getAllBlocks(false);

    for (const block of blocks) {
      this.checkBlockTypeErrors(block);
    }

    return this.typeErrors;
  }

  /**
   * Check for type errors in a specific block.
   * @param {Blockly.Block} block The block to check.
   */
  checkBlockTypeErrors(block) {
    const blockType = block.type;

    // Check typed variable getters
    if (blockType === 'typed_lexical_variable_get') {
      const varName = block.getFieldValue('VAR');
      const expectedType = block.getVariableType();
      const actualType = this.getVariableType(varName);

      if (actualType && !this.areTypesCompatible(expectedType, actualType)) {
        this.typeErrors.push({
          block: block,
          message: `Type mismatch: expected ${expectedType}, got ${actualType} for variable ${varName}`,
          severity: 'error'
        });
      }
    }

    // Check typed variable setters
    if (blockType === 'typed_lexical_variable_set') {
      const varName = block.getFieldValue('VAR');
      const expectedType = block.getVariableType();
      const actualType = this.getVariableType(varName);

      if (actualType && !this.areTypesCompatible(actualType, expectedType)) {
        this.typeErrors.push({
          block: block,
          message: `Type mismatch: cannot assign ${expectedType} to variable ${varName} of type ${actualType}`,
          severity: 'error'
        });
      }
    }

    // Check typed variable declarations
    if (blockType === 'typed_global_declaration' || blockType === 'typed_local_declaration_statement') {
      const varName = block.getFieldValue(blockType === 'typed_global_declaration' ? 'NAME' : 'VAR');
      const declaredType = block.getFieldValue('TYPE');
      
      // Check if variable is already declared
      if (this.isVariableDeclared(varName)) {
        this.typeErrors.push({
          block: block,
          message: `Variable ${varName} is already declared`,
          severity: 'error'
        });
      } else {
        // Register the variable
        this.registerVariable(varName, declaredType, 
          blockType === 'typed_global_declaration' ? 'global' : 'local');
      }
    }
  }

  /**
   * Get all type errors.
   * @return {Array} Array of type errors.
   */
  getTypeErrors() {
    return this.typeErrors;
  }

  /**
   * Clear all type errors.
   */
  clearTypeErrors() {
    this.typeErrors = [];
  }

  /**
   * Get a summary of all variable types in the workspace.
   * @return {Object} Object mapping variable names to their type information.
   */
  getVariableTypeSummary() {
    const summary = {};
    for (const [varName, typeInfo] of this.variableTypes) {
      summary[varName] = typeInfo;
    }
    return summary;
  }

  /**
   * Reset the type manager (clear all type information).
   */
  reset() {
    this.variableTypes.clear();
    this.blockTypes.clear();
    this.typeErrors = [];
  }

  /**
   * Export type information to JSON.
   * @return {string} JSON string containing type information.
   */
  exportTypeInfo() {
    return JSON.stringify({
      variableTypes: Object.fromEntries(this.variableTypes),
      blockTypes: Object.fromEntries(this.blockTypes),
      typeErrors: this.typeErrors
    }, null, 2);
  }

  /**
   * Import type information from JSON.
   * @param {string} jsonString JSON string containing type information.
   */
  importTypeInfo(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      this.variableTypes = new Map(Object.entries(data.variableTypes || {}));
      this.blockTypes = new Map(Object.entries(data.blockTypes || {}));
      this.typeErrors = data.typeErrors || [];
    } catch (error) {
      console.error('Failed to import type information:', error);
    }
  }
}
