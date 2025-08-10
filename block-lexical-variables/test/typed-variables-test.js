'use strict';

import {assert} from 'chai';
import * as Blockly from 'blockly/core';
import {LexicalVariablesPlugin} from '../src/index.js';

describe('Typed Variables', function() {
  let workspace;
  let typeManager;

  beforeEach(function() {
    // Create a workspace
    workspace = new Blockly.Workspace();
    
    // Initialize the plugin
    LexicalVariablesPlugin.init(workspace);
    
    // Create type manager
    typeManager = new LexicalVariablesPlugin.TypeManager(workspace);
  });

  afterEach(function() {
    workspace.dispose();
  });

  describe('TypeManager', function() {
    it('should register variables correctly', function() {
      typeManager.registerVariable('counter', 'number', 'global');
      typeManager.registerVariable('name', 'string', 'local');

      assert.equal(typeManager.getVariableType('counter'), 'number');
      assert.equal(typeManager.getVariableType('name'), 'string');
      assert.isTrue(typeManager.isVariableDeclared('counter'));
      assert.isTrue(typeManager.isVariableDeclared('name'));
    });

    it('should check type compatibility correctly', function() {
      assert.isTrue(typeManager.areTypesCompatible('number', 'int'));
      assert.isTrue(typeManager.areTypesCompatible('string', 'string'));
      assert.isTrue(typeManager.areTypesCompatible('any', 'number'));
      assert.isTrue(typeManager.areTypesCompatible('number', 'any'));
      
      assert.isFalse(typeManager.areTypesCompatible('string', 'number'));
      assert.isFalse(typeManager.areTypesCompatible('boolean', 'string'));
    });

    it('should handle array types correctly', function() {
      assert.isTrue(typeManager.areTypesCompatible('number[]', 'number[]'));
      assert.isTrue(typeManager.areTypesCompatible('string[]', 'string[]'));
      assert.isFalse(typeManager.areTypesCompatible('number[]', 'string[]'));
    });

    it('should handle pointer types correctly', function() {
      assert.isTrue(typeManager.areTypesCompatible('int*', 'int*'));
      assert.isTrue(typeManager.areTypesCompatible('float*', 'float*'));
      assert.isFalse(typeManager.areTypesCompatible('int*', 'float*'));
    });
  });

  describe('Typed Variable Blocks', function() {
    it('should create typed global declaration block', function() {
      const block = workspace.newBlock('typed_global_declaration');
      
      assert.isNotNull(block);
      assert.equal(block.type, 'typed_global_declaration');
      assert.isFunction(block.getVariableType);
      assert.isFunction(block.getVariableInfo);
    });

    it('should create typed local declaration block', function() {
      const block = workspace.newBlock('typed_local_declaration_statement');
      
      assert.isNotNull(block);
      assert.equal(block.type, 'typed_local_declaration_statement');
      assert.isFunction(block.getVariableType);
      assert.isFunction(block.getVariableInfo);
    });

    it('should create typed variable getter block', function() {
      const block = workspace.newBlock('typed_lexical_variable_get');
      
      assert.isNotNull(block);
      assert.equal(block.type, 'typed_lexical_variable_get');
      assert.isFunction(block.getVariableType);
      assert.isFunction(block.getVariableInfo);
    });

    it('should create typed variable setter block', function() {
      const block = workspace.newBlock('typed_lexical_variable_set');
      
      assert.isNotNull(block);
      assert.equal(block.type, 'typed_lexical_variable_set');
      assert.isFunction(block.getVariableType);
      assert.isFunction(block.getVariableInfo);
    });
  });

  describe('Type Fields', function() {
    it('should create FieldTypeDropdown with correct options', function() {
      const field = new LexicalVariablesPlugin.FieldTypeDropdown('number', 'typescript');
      
      assert.isNotNull(field);
      assert.equal(field.getValue(), 'number');
      assert.equal(field.getLanguage(), 'typescript');
    });

    it('should create FieldTypedLexicalVariable with correct properties', function() {
      const field = new LexicalVariablesPlugin.FieldTypedLexicalVariable('counter', 'number', 'typescript');
      
      assert.isNotNull(field);
      assert.equal(field.getValue(), 'counter');
      assert.equal(field.getType(), 'number');
      assert.equal(field.getLanguage(), 'typescript');
    });

    it('should change language correctly', function() {
      const field = new LexicalVariablesPlugin.FieldTypeDropdown('number', 'typescript');
      
      field.setLanguage('c');
      assert.equal(field.getLanguage(), 'c');
      
      // Check that C types are available
      const options = field.menuGenerator_;
      const hasIntType = options.some(option => option[1] === 'int');
      assert.isTrue(hasIntType);
    });
  });

  describe('Code Generation', function() {
    it('should generate TypeScript code for typed global declaration', function() {
      const block = workspace.newBlock('typed_global_declaration');
      block.setFieldValue('counter', 'NAME');
      block.setFieldValue('number', 'TYPE');
      
      // Mock the value input
      const mockValue = '0';
      block.getInput('DECL').connection.targetBlock = {
        valueToCode: () => mockValue
      };
      
      const code = Blockly.JavaScript.blockToCode(block);
      assert.include(code, 'declare global');
      assert.include(code, 'var counter: number = 0');
    });

    it('should generate TypeScript code for typed local declaration', function() {
      const block = workspace.newBlock('typed_local_declaration_statement');
      block.setFieldValue('name', 'VAR');
      block.setFieldValue('string', 'TYPE');
      
      // Mock the value input
      const mockValue = '"John"';
      block.getInput('DECL').connection.targetBlock = {
        valueToCode: () => mockValue
      };
      
      const code = Blockly.JavaScript.blockToCode(block);
      assert.include(code, 'let name: string = "John"');
    });
  });

  describe('Type Checking Integration', function() {
    it('should detect type errors in workspace', function() {
      // Create a typed variable declaration
      const declBlock = workspace.newBlock('typed_local_declaration_statement');
      declBlock.setFieldValue('counter', 'VAR');
      declBlock.setFieldValue('number', 'TYPE');
      
      // Create a typed variable setter with wrong type
      const setBlock = workspace.newBlock('typed_lexical_variable_set');
      setBlock.setFieldValue('counter', 'VAR');
      setBlock.fieldVar_.setType('string'); // Wrong type
      
      const errors = typeManager.checkTypeErrors();
      assert.isAtLeast(errors.length, 1);
      
      const typeError = errors.find(error => error.message.includes('Type mismatch'));
      assert.isNotNull(typeError);
    });

    it('should not report errors for compatible types', function() {
      // Create a typed variable declaration
      const declBlock = workspace.newBlock('typed_local_declaration_statement');
      declBlock.setFieldValue('counter', 'VAR');
      declBlock.setFieldValue('number', 'TYPE');
      
      // Create a typed variable setter with compatible type
      const setBlock = workspace.newBlock('typed_lexical_variable_set');
      setBlock.setFieldValue('counter', 'VAR');
      setBlock.fieldVar_.setType('int'); // Compatible with number
      
      const errors = typeManager.checkTypeErrors();
      const typeErrors = errors.filter(error => error.message.includes('Type mismatch'));
      assert.equal(typeErrors.length, 0);
    });
  });
});
