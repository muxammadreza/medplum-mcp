/**
 * Tool Completeness Tests
 * Verifies all consolidated tools are properly registered.
 */

import { toolMapping, toolDefinitions } from '../../src/tools/toolRegistry';

describe('Tool Completeness', () => {
  // Updated for aggressive consolidation: 48 → 17 tools
  const expectedTools = [
    // Consolidated CRUD
    'manageResource',
    'manageClinicalReport',
    'manageAutomation',
    // Patient data
    'patientData',
    // Project management
    'manageProject',
    // Media
    'manageMedia',
    // Initialization
    'startNew',
    // History
    'manageHistory',
    // Terminology
    'terminology',
    // Bulk operations
    'bulkData',
    // Standalone tools
    'whoAmI',
    'graphql',
    'sendEmail',
    'postBundle',
    'executeAdminTask',
    'executeFhirOperation',
    'manageFhirCast',
  ];

  test('should have all expected tools registered in toolMapping', () => {
    const registeredTools = Object.keys(toolMapping);
    
    for (const tool of expectedTools) {
      expect(registeredTools).toContain(tool);
    }
    
    // Verify we have exactly the expected number of tools
    expect(registeredTools.length).toBe(expectedTools.length);
  });

  test('should have all expected tools in toolDefinitions', () => {
    const definedTools = toolDefinitions.map((t) => t.name);
    
    for (const tool of expectedTools) {
      expect(definedTools).toContain(tool);
    }
    
    expect(definedTools.length).toBe(expectedTools.length);
  });

  test('should have matching tool counts between mapping and definitions', () => {
    expect(Object.keys(toolMapping).length).toBe(toolDefinitions.length);
  });

  test('consolidated tools should have action parameters', () => {
    const consolidatedTools = [
      'manageResource',
      'manageClinicalReport',
      'manageAutomation',
      'patientData',
      'manageProject',
      'manageMedia',
      'manageHistory',
      'terminology',
      'bulkData',
      'manageFhirCast',
    ];

    for (const toolName of consolidatedTools) {
      const tool = toolDefinitions.find((t) => t.name === toolName);
      expect(tool).toBeDefined();
      
      // Check that inputSchema has action or type property
      const schema = tool!.inputSchema as { properties?: Record<string, unknown> };
      const hasActionOrType = schema.properties?.action || schema.properties?.type;
      expect(hasActionOrType).toBeTruthy();
    }
  });
});
