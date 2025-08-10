'use strict';

import * as Blockly from 'blockly/core';
import '../inputs/indented_input.js';
import '../msg.js';
import {ErrorCheckers} from '../warningHandler.js';
import {FieldTypedLexicalVariable} from '../fields/field_typed_lexical_variable.js';
import {FieldTypeDropdown} from '../fields/field_type_dropdown.js';
import {FieldParameterFlydown} from '../fields/field_parameter_flydown.js';
import {lexicalVariableScopeMixin} from '../mixins.js';
import * as Shared from '../shared.js';

/**
 * Typed global variable declaration block.
 * Block type: 'typed_global_declaration'
 */
Blockly.Blocks['typed_global_declaration'] = {
  category: 'Variables',
  helpUrl: Blockly.Msg.LANG_VARIABLES_GLOBAL_DECLARATION_HELPURL,
  init: function() {
    this.setStyle('variable_blocks');
    
    // Create typed variable field
    this.fieldVar_ = new FieldTypedLexicalVariable('var', 'any', 'typescript');
    this.fieldVar_.setBlock(this);
    
    // Create type dropdown
    this.typeField_ = new FieldTypeDropdown('any', 'typescript');
    this.typeField_.setBlock(this);
    
    const declInput = this.appendValueInput('DECL');
    declInput.appendField('declare')
      .appendField('global')
      .appendField(this.fieldVar_, 'NAME')
      .appendField(':')
      .appendField(this.typeField_, 'TYPE')
      .appendField('=')
      .setAlign(Blockly.inputs.Align.RIGHT);
    
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Declare a typed global variable');
    
    this.errors = [
      {func: ErrorCheckers.checkIsInDefinition},
      {
        func: ErrorCheckers.checkDropDownContainsValidValue,
        dropDowns: ['NAME'],
      },
    ];
    
    this.setOnChange(function(changeEvent) {
      this.workspace.getWarningHandler().checkErrors(this);
    });
  },

  /**
   * Get the declared variables.
   * @return {Array<string>} Array of variable names.
   */
  getDeclaredVars: function() {
    return [this.getFieldValue('NAME')];
  },

  /**
   * Get the variable type.
   * @return {string} The variable type.
   */
  getVariableType: function() {
    return this.getFieldValue('TYPE');
  },

  /**
   * Get variable information.
   * @return {Object} Object containing name and type.
   */
  getVariableInfo: function() {
    return {
      name: this.getFieldValue('NAME'),
      type: this.getFieldValue('TYPE')
    };
  }
};

/**
 * Typed local variable declaration statement block.
 * Block type: 'typed_local_declaration_statement'
 */
Blockly.Blocks['typed_local_declaration_statement'] = {
  category: 'Variables',
  helpUrl: Blockly.Msg.LANG_VARIABLES_LOCAL_DECLARATION_STATEMENT_HELPURL,
  init: function() {
    this.setStyle('variable_blocks');
    
    // Create typed variable field
    this.fieldVar_ = new FieldTypedLexicalVariable('var', 'any', 'typescript');
    this.fieldVar_.setBlock(this);
    
    // Create type dropdown
    this.typeField_ = new FieldTypeDropdown('any', 'typescript');
    this.typeField_.setBlock(this);
    
    const declInput = this.appendValueInput('DECL');
    declInput.appendField('let')
      .appendField(this.fieldVar_, 'VAR')
      .appendField(':')
      .appendField(this.typeField_, 'TYPE')
      .appendField('=')
      .setAlign(Blockly.inputs.Align.RIGHT);
    
    this.appendStatementInput('DO')
      .appendField('in');
    
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Declare a typed local variable');
    
    this.mixin(lexicalVariableScopeMixin);
    
    this.errors = [
      {func: ErrorCheckers.checkIsInDefinition},
      {
        func: ErrorCheckers.checkDropDownContainsValidValue,
        dropDowns: ['VAR'],
      },
    ];
    
    this.setOnChange(function(changeEvent) {
      this.workspace.getWarningHandler().checkErrors(this);
    });
  },

  /**
   * Get the declared variable field names.
   * @return {Array<string>} Array of field names.
   */
  getDeclaredVarFieldNames: function() {
    return ['VAR'];
  },

  /**
   * Get the scoped input name.
   * @return {string} The input name.
   */
  getScopedInputName: function() {
    return 'DO';
  },

  /**
   * Get the variable type.
   * @return {string} The variable type.
   */
  getVariableType: function() {
    return this.getFieldValue('TYPE');
  },

  /**
   * Get variable information.
   * @return {Object} Object containing name and type.
   */
  getVariableInfo: function() {
    return {
      name: this.getFieldValue('VAR'),
      type: this.getFieldValue('TYPE')
    };
  }
};

/**
 * Typed variable getter block.
 * Block type: 'typed_lexical_variable_get'
 */
Blockly.Blocks['typed_lexical_variable_get'] = {
  category: 'Variables',
  helpUrl: Blockly.Msg.LANG_VARIABLES_GET_HELPURL,
  init: function() {
    this.setStyle('variable_blocks');
    
    // Create typed variable field
    this.fieldVar_ = new FieldTypedLexicalVariable(' ', 'any', 'typescript');
    this.fieldVar_.setBlock(this);
    
    this.appendDummyInput()
      .appendField(Blockly.Msg.LANG_VARIABLES_GET_TITLE_GET)
      .appendField(this.fieldVar_, 'VAR');
    
    this.setOutput(true, null);
    this.setTooltip(Blockly.Msg.LANG_VARIABLES_GET_TOOLTIP);
    
    this.errors = [
      {func: ErrorCheckers.checkIsInDefinition},
      {
        func: ErrorCheckers.checkDropDownContainsValidValue,
        dropDowns: ['VAR'],
      },
    ];
    
    this.setOnChange(function(changeEvent) {
      this.workspace.getWarningHandler().checkErrors(this);
    });
  },

  /**
   * Get the declared variables.
   * @return {Array<string>} Array of variable names.
   */
  getDeclaredVars: function() {
    return [this.getFieldValue('VAR')];
  },

  /**
   * Get the variable type.
   * @return {string} The variable type.
   */
  getVariableType: function() {
    return this.fieldVar_.getType();
  },

  /**
   * Get variable information.
   * @return {Object} Object containing name and type.
   */
  getVariableInfo: function() {
    return {
      name: this.getFieldValue('VAR'),
      type: this.fieldVar_.getType()
    };
  }
};

/**
 * Typed variable setter block.
 * Block type: 'typed_lexical_variable_set'
 */
Blockly.Blocks['typed_lexical_variable_set'] = {
  category: 'Variables',
  helpUrl: Blockly.Msg.LANG_VARIABLES_SET_HELPURL,
  init: function() {
    this.setStyle('variable_blocks');
    
    // Create typed variable field
    this.fieldVar_ = new FieldTypedLexicalVariable(' ', 'any', 'typescript');
    this.fieldVar_.setBlock(this);
    
    this.appendValueInput('VALUE')
      .appendField(Blockly.Msg.LANG_VARIABLES_SET_TITLE_SET)
      .appendField(this.fieldVar_, 'VAR')
      .appendField('to')
      .setAlign(Blockly.inputs.Align.RIGHT);
    
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.LANG_VARIABLES_SET_TOOLTIP);
    
    this.errors = [
      {func: ErrorCheckers.checkIsInDefinition},
      {
        func: ErrorCheckers.checkDropDownContainsValidValue,
        dropDowns: ['VAR'],
      },
    ];
    
    this.setOnChange(function(changeEvent) {
      this.workspace.getWarningHandler().checkErrors(this);
    });
  },

  /**
   * Get the declared variables.
   * @return {Array<string>} Array of variable names.
   */
  getDeclaredVars: function() {
    return [this.getFieldValue('VAR')];
  },

  /**
   * Get the variable type.
   * @return {string} The variable type.
   */
  getVariableType: function() {
    return this.fieldVar_.getType();
  },

  /**
   * Get variable information.
   * @return {Object} Object containing name and type.
   */
  getVariableInfo: function() {
    return {
      name: this.getFieldValue('VAR'),
      type: this.fieldVar_.getType()
    };
  }
};
