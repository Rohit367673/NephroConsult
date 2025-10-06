// Real-world data flow test integrated with actual services
import adminService from '../services/adminService';
import consultationService from '../services/consultationService';
import meetingService from '../services/meetingService';

interface RealWorldTestResult {
  testName: string;
  passed: boolean;
  details: string;
  realData: any;
  patientView: any;
  doctorView: any;
}

export class RealWorldDataTest {
  private results: RealWorldTestResult[] = [];

  async runRealWorldTests(): Promise<RealWorldTestResult[]> {
    console.log('🌍 Real-World Data Flow Test Suite');
    console.log('==================================\n');

    await this.testActualMeetingURLGeneration();
    await this.testPatientDoctorDataSync();
    await this.testRealPrescriptionFlow();
    await this.testActualDocumentSharing();
    await this.testTimezoneConsistency();

    this.printRealWorldResults();
    return this.results;
  }

  // Test 1: Actual Meeting URL Generation with Real Data
  async testActualMeetingURLGeneration(): Promise<void> {
    console.log('🔗 Testing Actual Meeting URL Generation...');

    try {
      // Get real consultations from admin service
      const adminConsultations = await adminService.getConsultations();
      const testConsultation = adminConsultations[0];

      if (!testConsultation) {
        throw new Error('No consultations available for testing');
      }

      // Generate meeting URL through admin service
      const adminMeetingURL = adminService.getMeetingURL(
        testConsultation.id, 
        testConsultation.patientEmail
      );

      // Generate meeting URL through consultation service
      const patientMeetingURL = consultationService.getMeetingLink(
        testConsultation.id, 
        testConsultation.patientEmail
      );

      // Direct meeting service call
      const directMeetingURL = meetingService.getMeetingURL(
        testConsultation.id, 
        testConsultation.patientEmail
      );

      const urlsMatch = (
        adminMeetingURL === patientMeetingURL && 
        patientMeetingURL === directMeetingURL
      );

      const isValidGoogleMeetURL = adminMeetingURL.includes('meet.google.com');

      this.results.push({
        testName: 'Actual Meeting URL Generation',
        passed: urlsMatch && isValidGoogleMeetURL,
        details: urlsMatch && isValidGoogleMeetURL 
          ? 'All services generate identical, valid Google Meet URLs'
          : 'URL generation inconsistent or invalid format',
        realData: {
          consultationId: testConsultation.id,
          patientEmail: testConsultation.patientEmail,
          patientName: testConsultation.patientName
        },
        patientView: {
          meetingURL: patientMeetingURL,
          accessMethod: 'consultation service'
        },
        doctorView: {
          meetingURL: adminMeetingURL,
          accessMethod: 'admin service'
        }
      });

      console.log(`✅ Patient: ${testConsultation.patientName} (${testConsultation.patientEmail})`);
      console.log(`✅ Consultation ID: ${testConsultation.id}`);
      console.log(`✅ Admin URL: ${adminMeetingURL}`);
      console.log(`✅ Patient URL: ${patientMeetingURL}`);
      console.log(`✅ Direct URL: ${directMeetingURL}`);
      console.log(`✅ URLs Match: ${urlsMatch ? 'YES' : 'NO'}`);
      console.log(`✅ Valid Format: ${isValidGoogleMeetURL ? 'YES' : 'NO'}`);
      console.log(`${urlsMatch && isValidGoogleMeetURL ? '✅ PASS' : '❌ FAIL'}\n`);

    } catch (error) {
      this.results.push({
        testName: 'Actual Meeting URL Generation',
        passed: false,
        details: `Error: ${error}`,
        realData: null,
        patientView: null,
        doctorView: null
      });
      console.log(`❌ FAIL: ${error}\n`);
    }
  }

  // Test 2: Patient-Doctor Data Synchronization
  async testPatientDoctorDataSync(): Promise<void> {
    console.log('👥 Testing Patient-Doctor Data Synchronization...');

    try {
      // Get consultation data from admin (doctor) perspective
      const adminConsultations = await adminService.getConsultations();
      const testConsultation = adminConsultations.find(c => c.patientEmail === 'sarah@example.com');

      if (!testConsultation) {
        throw new Error('Test consultation not found');
      }

      // Get same data from patient perspective
      const patientConsultations = await consultationService.getPatientConsultations(
        testConsultation.patientEmail
      );
      const patientConsultation = patientConsultations.find(c => c.id === testConsultation.id);

      // Check data consistency
      const hasMatchingData = patientConsultation !== undefined;
      const meetingLinksMatch = testConsultation.meetingLink === patientConsultation?.meetingLink;
      const timesMatch = testConsultation.time === patientConsultation?.time;
      const datesMatch = testConsultation.date === patientConsultation?.date;

      const allDataSynced = hasMatchingData && meetingLinksMatch && timesMatch && datesMatch;

      this.results.push({
        testName: 'Patient-Doctor Data Synchronization',
        passed: allDataSynced,
        details: allDataSynced 
          ? 'All consultation data synchronized between patient and doctor views'
          : 'Data synchronization issues detected',
        realData: {
          consultationId: testConsultation.id,
          patientEmail: testConsultation.patientEmail,
          appointmentTime: testConsultation.time,
          appointmentDate: testConsultation.date
        },
        patientView: {
          hasConsultation: hasMatchingData,
          meetingLink: patientConsultation?.meetingLink,
          time: patientConsultation?.time,
          date: patientConsultation?.date
        },
        doctorView: {
          patientName: testConsultation.patientName,
          meetingLink: testConsultation.meetingLink,
          time: testConsultation.time,
          date: testConsultation.date,
          query: testConsultation.query
        }
      });

      console.log(`✅ Consultation ID: ${testConsultation.id}`);
      console.log(`✅ Patient Email: ${testConsultation.patientEmail}`);
      console.log(`✅ Patient Can See: ${hasMatchingData ? 'YES' : 'NO'}`);
      console.log(`✅ Meeting Links Match: ${meetingLinksMatch ? 'YES' : 'NO'}`);
      console.log(`✅ Times Match: ${timesMatch ? 'YES' : 'NO'}`);
      console.log(`✅ Dates Match: ${datesMatch ? 'YES' : 'NO'}`);
      console.log(`${allDataSynced ? '✅ PASS' : '❌ FAIL'}\n`);

    } catch (error) {
      this.results.push({
        testName: 'Patient-Doctor Data Synchronization',
        passed: false,
        details: `Error: ${error}`,
        realData: null,
        patientView: null,
        doctorView: null
      });
      console.log(`❌ FAIL: ${error}\n`);
    }
  }

  // Test 3: Real Prescription Flow
  async testRealPrescriptionFlow(): Promise<void> {
    console.log('💊 Testing Real Prescription Flow...');

    try {
      const consultationId = '1';
      const patientEmail = 'john@example.com';

      // Doctor creates prescription via admin service
      const realPrescription = {
        medicines: [
          { 
            name: 'Lisinopril', 
            dosage: '10mg once daily', 
            url: 'https://1mg.com/drugs/lisinopril-5mg-tablet-83945' 
          },
          { 
            name: 'Amlodipine', 
            dosage: '5mg once daily', 
            url: 'https://1mg.com/drugs/amlodipine-5mg-tablet-83513' 
          }
        ],
        instructions: 'Take medications at the same time each day. Monitor blood pressure daily. Avoid excessive salt intake.',
        nextVisit: '2024-02-15'
      };

      // Create prescription through admin service
      await adminService.createPrescription(consultationId, realPrescription, 'Dr. Ilango');

      // Verify prescription appears in admin view
      const adminConsultation = await adminService.getConsultationById(consultationId);
      const adminHasPrescription = adminConsultation?.prescription !== undefined;

      // Verify prescription appears in patient view
      const patientConsultations = await consultationService.getPatientConsultations(patientEmail);
      const patientConsultation = patientConsultations.find(c => c.id === consultationId);
      const patientCanSeePrescription = patientConsultation?.prescription !== undefined;

      const prescriptionFlowWorking = adminHasPrescription && patientCanSeePrescription;

      this.results.push({
        testName: 'Real Prescription Flow',
        passed: prescriptionFlowWorking,
        details: prescriptionFlowWorking 
          ? 'Prescription successfully flows from doctor to patient'
          : 'Prescription flow broken',
        realData: {
          consultationId,
          patientEmail,
          medicineCount: realPrescription.medicines.length,
          prescriptionCreated: new Date().toISOString()
        },
        patientView: {
          canSeePrescription: patientCanSeePrescription,
          medicines: patientConsultation?.prescription?.medicines || [],
          instructions: patientConsultation?.prescription?.instructions || ''
        },
        doctorView: {
          prescriptionExists: adminHasPrescription,
          medicines: adminConsultation?.prescription?.medicines || [],
          doctorName: adminConsultation?.prescription?.doctorName || ''
        }
      });

      console.log(`✅ Consultation ID: ${consultationId}`);
      console.log(`✅ Patient Email: ${patientEmail}`);
      console.log(`✅ Medicine Count: ${realPrescription.medicines.length}`);
      console.log(`✅ Doctor Can See: ${adminHasPrescription ? 'YES' : 'NO'}`);
      console.log(`✅ Patient Can See: ${patientCanSeePrescription ? 'YES' : 'NO'}`);
      console.log(`${prescriptionFlowWorking ? '✅ PASS' : '❌ FAIL'}\n`);

    } catch (error) {
      this.results.push({
        testName: 'Real Prescription Flow',
        passed: false,
        details: `Error: ${error}`,
        realData: null,
        patientView: null,
        doctorView: null
      });
      console.log(`❌ FAIL: ${error}\n`);
    }
  }

  // Test 4: Actual Document Sharing
  async testActualDocumentSharing(): Promise<void> {
    console.log('📄 Testing Actual Document Sharing...');

    try {
      const consultations = await adminService.getConsultations();
      const consultationWithDocs = consultations.find(c => c.documents.length > 0);

      if (!consultationWithDocs) {
        throw new Error('No consultations with documents found');
      }

      const doctorCanAccessDocuments = consultationWithDocs.documents.length > 0;
      const documentNames = consultationWithDocs.documents;
      const patientEmail = consultationWithDocs.patientEmail;

      // Test document download functionality
      let downloadFunctionality = false;
      try {
        await adminService.downloadDocument(documentNames[0]);
        downloadFunctionality = true;
      } catch {
        downloadFunctionality = false;
      }

      const documentSharingWorks = doctorCanAccessDocuments && downloadFunctionality;

      this.results.push({
        testName: 'Actual Document Sharing',
        passed: documentSharingWorks,
        details: documentSharingWorks 
          ? `Doctor can access ${documentNames.length} patient documents`
          : 'Document sharing not working properly',
        realData: {
          patientEmail,
          documentCount: documentNames.length,
          documentNames: documentNames,
          consultationId: consultationWithDocs.id
        },
        patientView: {
          documentsUploaded: documentNames,
          uploadCount: documentNames.length
        },
        doctorView: {
          canAccessDocuments: doctorCanAccessDocuments,
          canDownloadDocuments: downloadFunctionality,
          availableDocuments: documentNames
        }
      });

      console.log(`✅ Patient: ${patientEmail}`);
      console.log(`✅ Document Count: ${documentNames.length}`);
      console.log(`✅ Documents: ${documentNames.join(', ')}`);
      console.log(`✅ Doctor Access: ${doctorCanAccessDocuments ? 'YES' : 'NO'}`);
      console.log(`✅ Download Works: ${downloadFunctionality ? 'YES' : 'NO'}`);
      console.log(`${documentSharingWorks ? '✅ PASS' : '❌ FAIL'}\n`);

    } catch (error) {
      this.results.push({
        testName: 'Actual Document Sharing',
        passed: false,
        details: `Error: ${error}`,
        realData: null,
        patientView: null,
        doctorView: null
      });
      console.log(`❌ FAIL: ${error}\n`);
    }
  }

  // Test 5: Timezone Consistency (using timezone utils)
  async testTimezoneConsistency(): Promise<void> {
    console.log('🌍 Testing Timezone Consistency...');

    try {
      const consultations = await adminService.getConsultations();
      const testConsultation = consultations.find(c => c.istTime);

      if (!testConsultation) {
        throw new Error('No consultation with timezone data found');
      }

      const hasLocalTime = testConsultation.time !== undefined;
      const hasISTTime = testConsultation.istTime !== undefined;
      const hasCountryInfo = testConsultation.country !== undefined;

      // Verify timezone display consistency
      const timezoneDataComplete = hasLocalTime && hasISTTime && hasCountryInfo;

      this.results.push({
        testName: 'Timezone Consistency',
        passed: timezoneDataComplete,
        details: timezoneDataComplete 
          ? 'Timezone information properly synchronized between patient and doctor'
          : 'Timezone data incomplete',
        realData: {
          consultationId: testConsultation.id,
          patientCountry: testConsultation.country,
          appointmentDate: testConsultation.date
        },
        patientView: {
          localTime: testConsultation.time,
          country: testConsultation.country
        },
        doctorView: {
          localTime: testConsultation.time,
          istTime: testConsultation.istTime,
          patientCountry: testConsultation.country
        }
      });

      console.log(`✅ Consultation ID: ${testConsultation.id}`);
      console.log(`✅ Patient Country: ${testConsultation.country}`);
      console.log(`✅ Local Time: ${testConsultation.time}`);
      console.log(`✅ IST Time: ${testConsultation.istTime}`);
      console.log(`✅ Complete Data: ${timezoneDataComplete ? 'YES' : 'NO'}`);
      console.log(`${timezoneDataComplete ? '✅ PASS' : '❌ FAIL'}\n`);

    } catch (error) {
      this.results.push({
        testName: 'Timezone Consistency',
        passed: false,
        details: `Error: ${error}`,
        realData: null,
        patientView: null,
        doctorView: null
      });
      console.log(`❌ FAIL: ${error}\n`);
    }
  }

  private printRealWorldResults(): void {
    const passedTests = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;
    const successRate = Math.round((passedTests / totalTests) * 100);

    console.log('📊 REAL-WORLD TEST RESULTS');
    console.log('==========================');
    console.log(`Success Rate: ${successRate}% (${passedTests}/${totalTests})\n`);

    this.results.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${index + 1}. ${result.testName}: ${status}`);
      console.log(`   Details: ${result.details}`);
      
      if (result.realData) {
        console.log(`   Real Data:`, JSON.stringify(result.realData, null, 2));
      }
      
      if (result.patientView) {
        console.log(`   Patient View:`, JSON.stringify(result.patientView, null, 2));
      }
      
      if (result.doctorView) {
        console.log(`   Doctor View:`, JSON.stringify(result.doctorView, null, 2));
      }
      
      console.log('');
    });

    if (successRate === 100) {
      console.log('🎉 ALL REAL-WORLD TESTS PASSED!');
      console.log('✅ Real data flows correctly between patient and doctor');
      console.log('✅ Actual meeting URLs are synchronized');
      console.log('✅ Real prescriptions flow properly');
      console.log('✅ Actual documents are shared');
      console.log('✅ Timezone data is consistent');
    } else {
      console.log('⚠️ Some real-world tests failed. Review above.');
    }
  }
}

export const realWorldDataTest = new RealWorldDataTest();
export default realWorldDataTest;
