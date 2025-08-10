'use strict';

import * as Blockly from 'blockly/core';

/**
 * A dropdown field for selecting variable types.
 * Supports common types for C and TypeScript.
 */
export class FieldTypeDropdown extends Blockly.FieldDropdown {
  /**
   * Constructor for the type dropdown field.
   * @param {string} defaultValue The default type value.
   * @param {string} language The target language ('c', 'typescript', or 'javascript').
   */
  constructor(defaultValue = 'any', language = 'typescript') {
    const options = FieldTypeDropdown.getTypeOptions(language);
    super(options);
    this.language = language;
    this.setValue(defaultValue);
  }

  /**
   * Get type options for the specified language.
   * @param {string} language The target language.
   * @return {Array<Array<string>>} Array of [display_name, value] pairs.
   */
  static getTypeOptions(language) {
    const commonTypes = [
      ['Any', 'any'],
      ['Number', 'number'],
      ['String', 'string'],
      ['Boolean', 'boolean'],
      ['Array', 'array'],
      ['Object', 'object'],
      ['Function', 'function'],
      ['Void', 'void']
    ];

    const cTypes = [
      ['int', 'int'],
      ['float', 'float'],
      ['double', 'double'],
      ['char', 'char'],
      ['char*', 'char*'],
      ['void', 'void'],
      ['bool', 'bool'],
      ['int*', 'int*'],
      ['float*', 'float*']
    ];

    const typescriptTypes = [
      ...commonTypes,
      ['Number[]', 'number[]'],
      ['String[]', 'string[]'],
      ['Boolean[]', 'boolean[]'],
      ['Promise<any>', 'Promise<any>'],
      ['Promise<number>', 'Promise<number>'],
      ['Promise<string>', 'Promise<string>'],
      ['Promise<boolean>', 'Promise<boolean>']
    ];

    const javascriptTypes = [
      ...commonTypes,
      ['Number[]', 'number[]'],
      ['String[]', 'string[]'],
      ['Boolean[]', 'boolean[]']
    ];

    switch (language.toLowerCase()) {
      case 'c':
        return cTypes;
      case 'typescript':
        return typescriptTypes;
      case 'javascript':
        return javascriptTypes;
      default:
        return typescriptTypes;
    }
  }

  /**
   * Set the language and update the options.
   * @param {string} language The target language.
   */
  setLanguage(language) {
    this.language = language;
    const options = FieldTypeDropdown.getTypeOptions(language);
    this.menuGenerator_ = options;
    if (this.sourceBlock_ && this.sourceBlock_.rendered) {
      this.sourceBlock_.render();
    }
  }

  /**
   * Get the current language.
   * @return {string} The current language.
   */
  getLanguage() {
    return this.language;
  }

  /**
   * Get the type value for code generation.
   * @return {string} The type value.
   */
  getTypeValue() {
    return this.getValue();
  }

  /**
   * Check if the type is an array type.
   * @return {boolean} True if the type is an array type.
   */
  isArrayType() {
    const value = this.getValue();
    return value.endsWith('[]') || value === 'array';
  }

  /**
   * Check if the type is a pointer type (for C).
   * @return {boolean} True if the type is a pointer type.
   */
  isPointerType() {
    const value = this.getValue();
    return value.endsWith('*');
  }

  /**
   * Get the base type without array or pointer modifiers.
   * @return {string} The base type.
   */
  getBaseType() {
    const value = this.getValue();
    if (value.endsWith('[]')) {
      return value.slice(0, -2);
    }
    if (value.endsWith('*')) {
      return value.slice(0, -1);
    }
    return value;
  }
}
