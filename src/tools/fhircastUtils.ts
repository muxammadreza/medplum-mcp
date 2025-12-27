import { medplum } from '../config/medplumClient';
import { SubscriptionRequest } from '@medplum/core';

export async function fhircastSubscribe(args: { topic: string; events: string[] }): Promise<SubscriptionRequest> {
  return medplum.fhircastSubscribe(args.topic, args.events as any[]);
}

export async function fhircastUnsubscribe(args: { subscriptionRequest: SubscriptionRequest }): Promise<void> {
  return medplum.fhircastUnsubscribe(args.subscriptionRequest);
}

export async function fhircastGetContext(args: { topic: string }): Promise<any> {
  return medplum.fhircastGetContext(args.topic);
}
