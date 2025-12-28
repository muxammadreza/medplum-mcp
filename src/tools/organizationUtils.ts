/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MedplumClient, normalizeErrorString } from '@medplum/core';
import { Organization, BundleEntry, Bundle, OperationOutcome, Identifier } from '@medplum/fhirtypes';
import { medplum, ensureAuthenticated } from '../config/medplumClient';

export interface CreateOrganizationArgs {
  name: string;
  alias?: string[];
  typeCode?: string;
  typeSystem?: string;
  typeDisplay?: string;
  phone?: string;
  email?: string;
  address?: {
    use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  identifierSystem?: string;
  identifierValue?: string;
  contact?: any[]; // Added for test compatibility
}

export interface GetOrganizationByIdArgs {
  organizationId: string;
}

export interface UpdateOrganizationArgs extends Omit<Partial<Organization>, 'resourceType' | 'id'> {
  // if specific simplified fields are needed, they can be added here
}

export interface OrganizationSearchArgs {
  name?: string;
  addressCity?: string;
  addressState?: string;
  identifier?: string;
  type?: string; // search by type code, optionally with system (system|code)
  _lastUpdated?: string;
  active?: boolean;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Creates a new Organization resource.
 * @param args - The details for the new organization.
 * @returns The created Organization resource.
 */
export async function createOrganization(args: CreateOrganizationArgs): Promise<Organization> {
  await ensureAuthenticated();

  if (!args.name) {
    throw new Error('Organization name is required.');
  }

  const organizationResource: Organization = {
    resourceType: 'Organization',
    name: args.name,
    active: true, // Default to active
  };

  if (args.alias && args.alias.length > 0) {
    organizationResource.alias = args.alias;
  }

  if (args.typeCode) {
    organizationResource.type = [
      {
        coding: [
          {
            system: args.typeSystem || 'http://terminology.hl7.org/CodeSystem/organization-type',
            code: args.typeCode,
            display: args.typeDisplay || args.typeCode,
          },
        ],
        text: args.typeDisplay || args.typeCode,
      },
    ];
  }

  if (args.phone || args.email) {
    organizationResource.telecom = [];
    if (args.phone) {
      organizationResource.telecom.push({ system: 'phone', value: args.phone, use: 'work' });
    }
    if (args.email) {
      organizationResource.telecom.push({ system: 'email', value: args.email, use: 'work' });
    }
  }

  if (args.address) {
    organizationResource.address = [
      {
        use: args.address.use || 'work',
        line: args.address.line,
        city: args.address.city,
        state: args.address.state,
        postalCode: args.address.postalCode,
        country: args.address.country,
      },
    ];
  }

  if (args.identifierValue) {
    const identifier: Identifier = { value: args.identifierValue };
    if (args.identifierSystem) {
      identifier.system = args.identifierSystem;
    }
    organizationResource.identifier = [identifier];
  }

  return medplum.createResource<Organization>(organizationResource);
}

/**
 * Retrieves an Organization resource by its ID.
 * @param args - The ID of the organization to retrieve.
 * @returns The Organization resource.
 */
export async function getOrganizationById(args: { organizationId: string } | string): Promise<Organization | null> {
  await ensureAuthenticated();

  // Handle both string and object parameter formats
  const organizationId = typeof args === 'string' ? args : args.organizationId;

  if (!organizationId) {
    throw new Error('Organization ID is required to fetch an organization.');
  }
  try {
    // Remove generic type, let Medplum infer it
    return await medplum.readResource('Organization', organizationId);
  } catch (error: any) {
    if (error.outcome?.issue?.[0]?.code === 'not-found') {
      return null;
    }
    throw error;
  }
}

/**
 * Updates an existing Organization resource.
 * @param organizationId - The ID of the organization to update.
 * @param updates - The partial data to update the organization with.
 * @returns The updated Organization resource.
 */
export async function updateOrganization(
  organizationId: string,
  updates: UpdateOrganizationArgs,
): Promise<Organization> {
  await ensureAuthenticated();

  if (!organizationId) {
    throw new Error('Organization ID is required to update an organization.');
  }
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('Updates object cannot be empty for updating an organization.');
  }

  const existingOrganization = await medplum.readResource('Organization', organizationId);
  if (!existingOrganization) {
    throw new Error(`Organization with ID ${organizationId} not found.`);
  }

  const { resourceType, id, ...safeUpdates } = updates as any;

  const organizationToUpdate: Organization = {
    ...existingOrganization,
    ...safeUpdates,
    resourceType: 'Organization',
    id: organizationId,
  };

  return medplum.updateResource(organizationToUpdate);
}

export interface OrganizationSearchCriteria {
  name?: string;
  address?: string;
  // Add other searchable fields as needed, e.g., 'address-city', 'address-postalcode'
  // Medplum search parameters: https://www.medplum.com/docs/search/clinical-resources/organization
}

/**
 * Searches for Organization resources based on criteria.
 * @param args - The search criteria.
 * @returns A bundle of Organization resources matching the criteria.
 */
export async function searchOrganizations(searchArgs: OrganizationSearchArgs): Promise<Organization[]> {
  await ensureAuthenticated();

  const searchCriteria: string[] = [];

  if (searchArgs.name) {
    searchCriteria.push(`name=${encodeURIComponent(searchArgs.name)}`);
  }
  if (searchArgs.identifier) {
    searchCriteria.push(`identifier=${encodeURIComponent(searchArgs.identifier)}`);
  }
  if (searchArgs.type) {
    searchCriteria.push(`type=${encodeURIComponent(searchArgs.type)}`);
  }
  if (searchArgs.active !== undefined) {
    searchCriteria.push(`active=${searchArgs.active}`);
  }
  if (searchArgs.address) {
    searchCriteria.push(`address=${encodeURIComponent(searchArgs.address)}`);
  }
  if (searchArgs.city) {
    searchCriteria.push(`address-city=${encodeURIComponent(searchArgs.city)}`);
  }
  if (searchArgs.state) {
    searchCriteria.push(`address-state=${encodeURIComponent(searchArgs.state)}`);
  }
  if (searchArgs.postalCode) {
    searchCriteria.push(`address-postalcode=${encodeURIComponent(searchArgs.postalCode)}`);
  }
  if (searchArgs.country) {
    searchCriteria.push(`address-country=${encodeURIComponent(searchArgs.country)}`);
  }

  if (searchCriteria.length === 0) {
    return [];
  }

  const queryString = searchCriteria.join('&');
  return medplum.searchResources('Organization', queryString);
}
