import { ensureAuthenticated, medplum } from '../../src/config/medplumClient';
import { createPatient, CreatePatientArgs } from '../../src/tools/patientUtils';
import {
  createDiagnosticReport,
  getDiagnosticReportById,
  searchDiagnosticReports,
  updateDiagnosticReport,
} from '../../src/tools/diagnosticReportUtils';
import { DiagnosticReport } from '@medplum/fhirtypes';

describe('DiagnosticReport Tools Integration Tests', () => {
  let patientId: string | undefined;
  let diagnosticReportId: string | undefined;

  beforeAll(async () => {
    await ensureAuthenticated();
  });

  describe('createDiagnosticReport', () => {
    it('should create a diagnostic report for a patient', async () => {
      const patientInput: CreatePatientArgs = {
        firstName: 'Diag',
        lastName: 'Report',
        birthDate: '1990-01-01',
      };
      const patient = await createPatient(patientInput);
      patientId = patient.id;

      const report = await createDiagnosticReport({
        status: 'final',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '58410-2',
              display: 'Complete blood count (hemogram) panel',
            },
          ],
          text: 'CBC Panel',
        },
        subjectId: patientId,
        effectiveDateTime: new Date().toISOString(),
        conclusion: 'Within normal limits',
      });

      diagnosticReportId = report.id;
      expect(report).toBeDefined();
      expect(report.status).toBe('final');
      expect(report.subject?.reference).toBe(`Patient/${patientId}`);
    });
  });

  describe('getDiagnosticReportById', () => {
    it('should retrieve an existing diagnostic report by ID', async () => {
      if (!diagnosticReportId) throw new Error('DiagnosticReport not created');
      const report = await getDiagnosticReportById(diagnosticReportId);
      expect(report).toBeDefined();
      expect(report?.id).toBe(diagnosticReportId);
    });
  });

  describe('updateDiagnosticReport', () => {
    it('should update an existing diagnostic report', async () => {
      if (!diagnosticReportId) throw new Error('DiagnosticReport not created');

      const updated = await updateDiagnosticReport(diagnosticReportId, {
        status: 'amended',
        conclusion: 'Updated conclusion text',
      });

      expect(updated.status).toBe('amended');
      expect(updated.conclusion).toBe('Updated conclusion text');
    });
  });

  describe('searchDiagnosticReports', () => {
    it('should find diagnostic reports for the patient', async () => {
      if (!patientId) throw new Error('Patient not created');
      const reports = await searchDiagnosticReports({ patientId });
      expect(reports).toBeDefined();
      expect(Array.isArray(reports)).toBe(true);
      expect(reports.some((r) => r.id === diagnosticReportId)).toBe(true);
    });
  });

  afterAll(async () => {
    if (diagnosticReportId) {
      try {
        await medplum.deleteResource('DiagnosticReport', diagnosticReportId);
      } catch (error) {
        console.error('Failed to delete diagnostic report', error);
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
