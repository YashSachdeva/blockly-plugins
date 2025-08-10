'use strict';

import * as Blockly from 'blockly/core';
import {FieldLexicalVariable} from './field_lexical_variable.js';
import {FieldTypeDropdown} from './field_type_dropdown.js';

/**
 * A lexical variable field that includes type information.
 * Extends FieldLexicalVariable to add type support.
 */
export class FieldTypedLexicalVariable extends FieldLexicalVariable {
  /**
   * Constructor for the typed lexical variable field.
   * @param {string} varname The default variable name.
   * @param {string} type The default type.
   * @param {string} language The target language.
   * @param {string} translatedName The translated name (optional).
   */
  constructor(varname, type = 'any', language = 'typescript', translatedName) {
    super(varname, translatedName);
    this.type = type;
    this.language = language;
    this.typeField = new FieldTypeDropdown(type, language);
  }

  /**
   * Set the type for this variable.
   * @param {string} type The type value.
   */
  setType(type) {
    this.type = type;
    if (this.typeField) {
      this.typeField.setValue(type);
    }
  }

  /**
   * Get the type for this variable.
   * @return {string} The type value.
   */
  getType() {
    return this.type;
  }

  /**
   * Set the language and update type options.
   * @param {string} language The target language.
   */
  setLanguage(language) {
    this.language = language;
    if (this.typeField) {
      this.typeField.setLanguage(language);
    }
  }

  /**
   * Get the language.
   * @return {string} The current language.
   */
  getLanguage() {
    return this.language;
  }

  /**
   * Get the type field.
   * @return {FieldTypeDropdown} The type field.
   */
  getTypeField() {
    return this.typeField;
  }

  /**
   * Check if this variable has a specific type (not 'any').
   * @return {boolean} True if the variable has a specific type.
   */
  hasSpecificType() {
    return this.type && this.type !== 'any';
  }

  /**
   * Get the variable information as an object.
   * @return {Object} Object containing name and type.
   */
  getVariableInfo() {
    return {
      name: this.getValue(),
      type: this.type,
      language: this.language
    };
  }

  /**
   * Set the variable information from an object.
   * @param {Object} info Object containing name and type.
   */
  setVariableInfo(info) {
    if (info.name) {
      this.setValue(info.name);
    }
    if (info.type) {
      this.setType(info.type);
    }
    if (info.language) {
      this.setLanguage(info.language);
    }
  }
}
