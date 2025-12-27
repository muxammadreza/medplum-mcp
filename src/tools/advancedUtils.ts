import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { OperationOutcome, Bot, Reference, Agent } from '@medplum/fhirtypes';

export interface ExecuteBotArgs {
  botId: string;
  data: any;
  contentType?: string;
}

export async function executeBot(args: ExecuteBotArgs): Promise<any> {
  await ensureAuthenticated();
  // `executeBot` implementation in SDK usually handles serialization, but we might need to be explicit about content type if it's not JSON
  // medplum.executeBot(botId: string, data: any, contentType?: string): Promise<any>
  return medplum.executeBot(args.botId, args.data, args.contentType || 'application/json');
}

export interface GraphqlArgs {
  query: string;
  operationName?: string;
  variables?: Record<string, any>;
}

export async function graphql(args: GraphqlArgs): Promise<any> {
  await ensureAuthenticated();
  return medplum.graphql(args.query, args.operationName, args.variables);
}

export interface PushToAgentArgs {
  agentId: string;
  body: string;
  contentType?: string;
  destination?: string;
  waitForResponse?: boolean;
}

export async function pushToAgent(args: PushToAgentArgs): Promise<any> {
  await ensureAuthenticated();
  // pushToAgent(agentId: string | Reference<Agent>, body: string, contentType?: string, destination?: string, waitForResponse?: boolean): Promise<any>
  const agentReference: Reference<Agent> = { reference: `Agent/${args.agentId}` };
  return medplum.pushToAgent(
    agentReference,
    args.body,
    args.contentType || 'text/plain',
    args.destination,
    args.waitForResponse,
  );
}
