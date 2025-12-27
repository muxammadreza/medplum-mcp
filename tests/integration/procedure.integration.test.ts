import { ensureAuthenticated, medplum } from '../../src/config/medplumClient';
import { createPatient, CreatePatientArgs } from '../../src/tools/patientUtils';
import {
  createProcedure,
  getProcedureById,
  searchProcedures,
  updateProcedure,
} from '../../src/tools/procedureUtils';
import { Procedure } from '@medplum/fhirtypes';

describe('Procedure Tools Integration Tests', () => {
  let patientId: string | undefined;
  let procedureId: string | undefined;

  beforeAll(async () => {
    await ensureAuthenticated();
  });

  describe('createProcedure', () => {
    it('should create a procedure for a patient', async () => {
      const patientInput: CreatePatientArgs = {
        firstName: 'Proc',
        lastName: 'Integration',
        birthDate: '1985-05-05',
      };
      const patient = await createPatient(patientInput);
      patientId = patient.id;

      const procedure = await createProcedure({
        status: 'completed',
        code: {
          coding: [
            {
              system: 'http://www.ama-assn.org/go/cpt',
              code: '93000',
              display: 'Electrocardiogram',
            },
          ],
          text: 'ECG',
        },
        subjectId: patientId,
        performedDateTime: new Date().toISOString(),
        note: 'Baseline ECG',
      });

      procedureId = procedure.id;
      expect(procedure).toBeDefined();
      expect(procedure.status).toBe('completed');
      expect(procedure.subject?.reference).toBe(`Patient/${patientId}`);
    });
  });

  describe('getProcedureById', () => {
    it('should retrieve an existing procedure by ID', async () => {
      if (!procedureId) throw new Error('Procedure not created');
      const procedure = await getProcedureById(procedureId);
      expect(procedure).toBeDefined();
      expect(procedure?.id).toBe(procedureId);
    });
  });

  describe('updateProcedure', () => {
    it('should update an existing procedure', async () => {
      if (!procedureId) throw new Error('Procedure not created');

      const updated: Procedure = await updateProcedure(procedureId, {
        status: 'amended',
        note: 'Updated note',
      });

      expect(updated.status).toBe('amended');
      expect(updated.note?.[0]?.text).toBe('Updated note');
    });
  });

  describe('searchProcedures', () => {
    it('should find procedures for the patient', async () => {
      if (!patientId) throw new Error('Patient not created');
      const procedures = await searchProcedures({ patientId });
      expect(procedures).toBeDefined();
      expect(Array.isArray(procedures)).toBe(true);
      expect(procedures.some((p) => p.id === procedureId)).toBe(true);
    });
  });

  afterAll(async () => {
    if (procedureId) {
      try {
        await medplum.deleteResource('Procedure', procedureId);
      } catch (error) {
        console.error('Failed to delete procedure', error);
      }
    }
    if (patientId) {
      try {
        await medplum.deleteResource('Patient', patientId);
      } catch (error) {
        console.error('Failed to delete patient', error);
      }
    }
  });
});
