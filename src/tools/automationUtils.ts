import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { Bot, Subscription, OperationOutcome, Bundle, ResourceType } from '@medplum/fhirtypes';

// ============================================================================
// TYPES
// ============================================================================

export type AutomationAction =
  | 'deploy-bot'
  | 'execute-bot'
  | 'create-bot'
  | 'create-subscription'
  | 'get-subscription'
  | 'update-subscription'
  | 'delete-subscription'
  | 'reload-agent';

export interface ManageAutomationArgs {
  action: AutomationAction;
  // Bot parameters
  botId?: string;
  botCode?: string;
  botFilename?: string;
  botInput?: Record<string, unknown>;
  botName?: string;
  botDescription?: string;
  // Subscription parameters
  subscriptionId?: string;
  subscriptionCriteria?: string;
  subscriptionEndpoint?: string;
  subscriptionReason?: string;
  subscriptionStatus?: 'active' | 'off' | 'error';
  // Agent parameters
  agentId?: string;
}

export interface AutomationResult {
  success: boolean;
  action: AutomationAction;
  data?: unknown;
  error?: string;
}

// ============================================================================
// MAIN CONSOLIDATED TOOL
// ============================================================================

/**
 * Unified tool for managing automation resources: Bots, Subscriptions, and Agents.
 * Consolidates multiple operations into a single tool with action parameter.
 */
export async function manageAutomation(args: ManageAutomationArgs): Promise<AutomationResult> {
  await ensureAuthenticated();

  const { action } = args;

  try {
    switch (action) {
      case 'deploy-bot':
        return await deployBot(args);
      case 'execute-bot':
        return await executeBot(args);
      case 'create-bot':
        return await createBot(args);
      case 'create-subscription':
        return await createSubscription(args);
      case 'get-subscription':
        return await getSubscription(args);
      case 'update-subscription':
        return await updateSubscription(args);
      case 'delete-subscription':
        return await deleteSubscription(args);
      case 'reload-agent':
        return await reloadAgentConfig(args);
      default:
        return {
          success: false,
          action,
          error: `Unknown action: ${action}. Valid actions: deploy-bot, execute-bot, create-bot, create-subscription, get-subscription, update-subscription, delete-subscription, reload-agent`,
        };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      action,
      error: errorMessage,
    };
  }
}

// ============================================================================
// BOT OPERATIONS
// ============================================================================

async function deployBot(args: ManageAutomationArgs): Promise<AutomationResult> {
  const { botId, botCode, botFilename } = args;

  if (!botId) {
    return { success: false, action: 'deploy-bot', error: 'botId is required' };
  }
  if (!botCode) {
    return { success: false, action: 'deploy-bot', error: 'botCode is required' };
  }

  // Use the $deploy operation
  const result = await medplum.post(
    medplum.fhirUrl('Bot', botId, '$deploy'),
    {
      code: botCode,
      filename: botFilename || 'index.js',
    }
  );

  return {
    success: true,
    action: 'deploy-bot',
    data: result,
  };
}

async function executeBot(args: ManageAutomationArgs): Promise<AutomationResult> {
  const { botId, botInput } = args;

  if (!botId) {
    return { success: false, action: 'execute-bot', error: 'botId is required' };
  }

  const result = await medplum.executeBot(botId, botInput || {});

  return {
    success: true,
    action: 'execute-bot',
    data: result,
  };
}

async function createBot(args: ManageAutomationArgs): Promise<AutomationResult> {
  const { botName, botDescription } = args;

  if (!botName) {
    return { success: false, action: 'create-bot', error: 'botName is required' };
  }

  const bot: Partial<Bot> = {
    resourceType: 'Bot',
    name: botName,
    description: botDescription,
  };

  const result = await medplum.createResource(bot as Bot);

  return {
    success: true,
    action: 'create-bot',
    data: result,
  };
}

// ============================================================================
// SUBSCRIPTION OPERATIONS
// ============================================================================

async function createSubscription(args: ManageAutomationArgs): Promise<AutomationResult> {
  const { subscriptionCriteria, subscriptionEndpoint, subscriptionReason } = args;

  if (!subscriptionCriteria) {
    return { success: false, action: 'create-subscription', error: 'subscriptionCriteria is required' };
  }
  if (!subscriptionEndpoint) {
    return { success: false, action: 'create-subscription', error: 'subscriptionEndpoint is required' };
  }

  const subscription: Partial<Subscription> = {
    resourceType: 'Subscription',
    status: 'active',
    criteria: subscriptionCriteria,
    reason: subscriptionReason || 'Created via MCP',
    channel: {
      type: 'rest-hook',
      endpoint: subscriptionEndpoint,
    },
  };

  const result = await medplum.createResource(subscription as Subscription);

  return {
    success: true,
    action: 'create-subscription',
    data: result,
  };
}

async function getSubscription(args: ManageAutomationArgs): Promise<AutomationResult> {
  const { subscriptionId } = args;

  if (!subscriptionId) {
    return { success: false, action: 'get-subscription', error: 'subscriptionId is required' };
  }

  try {
    const result = await medplum.readResource('Subscription', subscriptionId);
    return {
      success: true,
      action: 'get-subscription',
      data: result,
    };
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'outcome' in error &&
      (error as { outcome?: OperationOutcome }).outcome?.issue?.[0]?.code === 'not-found'
    ) {
      return {
        success: true,
        action: 'get-subscription',
        data: null,
      };
    }
    throw error;
  }
}

async function updateSubscription(args: ManageAutomationArgs): Promise<AutomationResult> {
  const { subscriptionId, subscriptionStatus, subscriptionEndpoint, subscriptionCriteria } = args;

  if (!subscriptionId) {
    return { success: false, action: 'update-subscription', error: 'subscriptionId is required' };
  }

  const existing = await medplum.readResource('Subscription', subscriptionId);
  const updates: Partial<Subscription> = {};

  if (subscriptionStatus) updates.status = subscriptionStatus;
  if (subscriptionCriteria) updates.criteria = subscriptionCriteria;
  if (subscriptionEndpoint && existing.channel) {
    updates.channel = { ...existing.channel, endpoint: subscriptionEndpoint };
  }

  const updated = { ...existing, ...updates };
  const result = await medplum.updateResource(updated);

  return {
    success: true,
    action: 'update-subscription',
    data: result,
  };
}

async function deleteSubscription(args: ManageAutomationArgs): Promise<AutomationResult> {
  const { subscriptionId } = args;

  if (!subscriptionId) {
    return { success: false, action: 'delete-subscription', error: 'subscriptionId is required' };
  }

  await medplum.deleteResource('Subscription', subscriptionId);

  return {
    success: true,
    action: 'delete-subscription',
  };
}

// ============================================================================
// AGENT OPERATIONS
// ============================================================================

async function reloadAgentConfig(args: ManageAutomationArgs): Promise<AutomationResult> {
  const { agentId } = args;

  if (!agentId) {
    return { success: false, action: 'reload-agent', error: 'agentId is required' };
  }

  // Use the $reload-config operation
  const result = await medplum.post(
    medplum.fhirUrl('Agent', agentId, '$reload-config'),
    {}
  );

  return {
    success: true,
    action: 'reload-agent',
    data: result,
  };
}
