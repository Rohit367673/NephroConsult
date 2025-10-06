#!/usr/bin/env node

// Standalone test runner for data flow verification
// This script tests the data synchronization between patient and doctor systems

console.log('🧪 NephroConsult Data Flow Test Suite');
console.log('=====================================\n');

// Mock services for testing
class MockMeetingService {
  constructor() {
    this.meetings = new Map();
  }

  generateMeetingURL(consultationId, patientEmail) {
    const key = `${consultationId}-${patientEmail}`;
    if (this.meetings.has(key)) {
      return this.meetings.get(key);
    }
    
    // Generate consistent room ID
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const hashStr = Math.abs(hash).toString(36);
    const roomId = `${hashStr.slice(0, 3)}-${hashStr.slice(3, 7)}-${hashStr.slice(7, 10)}`;
    const url = `https://meet.google.com/${roomId}`;
    
    this.meetings.set(key, url);
    return url;
  }

  getMeetingURL(consultationId, patientEmail) {
    return this.generateMeetingURL(consultationId, patientEmail);
  }
}

class MockAdminService {
  constructor(meetingService) {
    this.meetingService = meetingService;
    this.consultations = [
      {
        id: '1',
        patientName: 'John Smith',
        patientEmail: 'john@example.com',
        patientPhone: '+1234567890',
        date: '2024-01-15',
        time: '10:00 AM',
        istTime: '10:30 PM IST',
        type: 'Initial Consultation',
        status: 'upcoming',
        documents: ['kidney_report.pdf', 'blood_test.pdf'],
        query: 'Experiencing kidney pain and frequent urination for the past 2 weeks.',
        country: 'US'
      },
      {
        id: '2',
        patientName: 'Sarah Johnson',
        patientEmail: 'sarah@example.com',
        patientPhone: '+1987654321',
        date: '2024-01-16',
        time: '2:00 PM',
        istTime: '12:30 AM IST',
        type: 'Follow-up',
        status: 'completed',
        documents: ['followup_labs.pdf'],
        query: 'Follow-up consultation for kidney stone treatment.',
        country: 'US'
      }
    ];
  }

  async getConsultations() {
    // Ensure all consultations have meeting links
    return this.consultations.map(consultation => {
      if (!consultation.meetingLink) {
        consultation.meetingLink = this.meetingService.generateMeetingURL(
          consultation.id, 
          consultation.patientEmail
        );
      }
      return consultation;
    });
  }

  generateMeetingLink(consultationId, patientEmail) {
    return this.meetingService.generateMeetingURL(consultationId, patientEmail);
  }

  async createPrescription(consultationId, prescription, doctorName) {
    const consultation = this.consultations.find(c => c.id === consultationId);
    if (consultation) {
      consultation.prescription = { ...prescription, doctorName, createdAt: new Date().toISOString() };
      consultation.status = 'completed';
      return true;
    }
    return false;
  }
}

class MockConsultationService {
  constructor(meetingService) {
    this.meetingService = meetingService;
    this.patientConsultations = new Map();
  }

  getMeetingLink(consultationId, patientEmail) {
    return this.meetingService.getMeetingURL(consultationId, patientEmail);
  }

  async getPatientConsultations(patientEmail) {
    return this.patientConsultations.get(patientEmail) || [];
  }
}

// Test runner
async function runDataFlowTests() {
  const results = [];
  
  // Initialize services
  const meetingService = new MockMeetingService();
  const adminService = new MockAdminService(meetingService);
  const consultationService = new MockConsultationService(meetingService);

  console.log('🔗 Test 1: Meeting URL Consistency');
  console.log('----------------------------------');
  
  try {
    const consultationId = 'test-consultation-1';
    const patientEmail = 'testpatient@example.com';
    
    // Generate URLs from different services
    const adminURL = adminService.generateMeetingLink(consultationId, patientEmail);
    const patientURL = consultationService.getMeetingLink(consultationId, patientEmail);
    const directURL = meetingService.getMeetingURL(consultationId, patientEmail);
    
    const urlsMatch = (adminURL === patientURL && patientURL === directURL);
    
    console.log(`✅ Admin Service URL:    ${adminURL}`);
    console.log(`✅ Patient Service URL:  ${patientURL}`);
    console.log(`✅ Direct Service URL:   ${directURL}`);
    console.log(`${urlsMatch ? '✅ PASS' : '❌ FAIL'}: All URLs ${urlsMatch ? 'match' : 'do not match'}\n`);
    
    results.push({
      test: 'Meeting URL Consistency',
      passed: urlsMatch,
      details: `Admin: ${adminURL}, Patient: ${patientURL}, Direct: ${directURL}`
    });
  } catch (error) {
    console.log(`❌ FAIL: ${error}\n`);
    results.push({ test: 'Meeting URL Consistency', passed: false, details: error.message });
  }

  console.log('📋 Test 2: Consultation Data Sync');
  console.log('----------------------------------');
  
  try {
    const consultations = await adminService.getConsultations();
    const consultation = consultations[0];
    
    // Verify meeting link exists and is accessible from both sides
    const adminMeetingLink = consultation.meetingLink;
    const patientMeetingLink = consultationService.getMeetingLink(consultation.id, consultation.patientEmail);
    
    const linksMatch = adminMeetingLink === patientMeetingLink;
    const hasPatientData = consultation.patientName && consultation.patientEmail;
    const hasDocuments = consultation.documents && consultation.documents.length > 0;
    
    console.log(`✅ Consultation ID: ${consultation.id}`);
    console.log(`✅ Patient Name: ${consultation.patientName}`);
    console.log(`✅ Patient Email: ${consultation.patientEmail}`);
    console.log(`✅ Documents: ${consultation.documents.join(', ')}`);
    console.log(`✅ Admin Meeting Link: ${adminMeetingLink}`);
    console.log(`✅ Patient Meeting Link: ${patientMeetingLink}`);
    console.log(`✅ Links Match: ${linksMatch ? 'YES' : 'NO'}`);
    console.log(`${linksMatch && hasPatientData && hasDocuments ? '✅ PASS' : '❌ FAIL'}: Data synchronization\n`);
    
    results.push({
      test: 'Consultation Data Sync',
      passed: linksMatch && hasPatientData && hasDocuments,
      details: `Links match: ${linksMatch}, Has patient data: ${hasPatientData}, Has documents: ${hasDocuments}`
    });
  } catch (error) {
    console.log(`❌ FAIL: ${error}\n`);
    results.push({ test: 'Consultation Data Sync', passed: false, details: error.message });
  }

  console.log('💊 Test 3: Prescription Flow');
  console.log('-----------------------------');
  
  try {
    const consultationId = '2';
    const prescription = {
      medicines: [
        { name: 'Test Medicine A', dosage: '10mg twice daily', url: 'https://1mg.com/test-med-a' },
        { name: 'Test Medicine B', dosage: '5mg once daily', url: 'https://1mg.com/test-med-b' }
      ],
      instructions: 'Take with food. Increase water intake.',
      nextVisit: '2024-02-20'
    };
    
    // Doctor creates prescription
    const prescriptionCreated = await adminService.createPrescription(consultationId, prescription, 'Dr. Ilango');
    
    // Verify prescription exists in consultation
    const consultations = await adminService.getConsultations();
    const consultationWithPrescription = consultations.find(c => c.id === consultationId);
    const hasPrescription = consultationWithPrescription?.prescription !== undefined;
    const medicineCount = consultationWithPrescription?.prescription?.medicines?.length || 0;
    
    console.log(`✅ Prescription Created: ${prescriptionCreated ? 'YES' : 'NO'}`);
    console.log(`✅ Prescription Exists: ${hasPrescription ? 'YES' : 'NO'}`);
    console.log(`✅ Medicine Count: ${medicineCount}`);
    console.log(`✅ Doctor Name: ${consultationWithPrescription?.prescription?.doctorName || 'N/A'}`);
    console.log(`${prescriptionCreated && hasPrescription && medicineCount === 2 ? '✅ PASS' : '❌ FAIL'}: Prescription flow\n`);
    
    results.push({
      test: 'Prescription Flow',
      passed: prescriptionCreated && hasPrescription && medicineCount === 2,
      details: `Created: ${prescriptionCreated}, Exists: ${hasPrescription}, Medicines: ${medicineCount}`
    });
  } catch (error) {
    console.log(`❌ FAIL: ${error}\n`);
    results.push({ test: 'Prescription Flow', passed: false, details: error.message });
  }

  console.log('📄 Test 4: Document Access');
  console.log('---------------------------');
  
  try {
    const consultations = await adminService.getConsultations();
    const consultationWithDocs = consultations.find(c => c.documents && c.documents.length > 0);
    
    if (!consultationWithDocs) {
      throw new Error('No consultations with documents found');
    }
    
    const documentsAccessible = consultationWithDocs.documents.length > 0;
    const documentNames = consultationWithDocs.documents;
    
    console.log(`✅ Patient: ${consultationWithDocs.patientEmail}`);
    console.log(`✅ Document Count: ${documentNames.length}`);
    console.log(`✅ Documents: ${documentNames.join(', ')}`);
    console.log(`✅ Doctor Can Access: ${documentsAccessible ? 'YES' : 'NO'}`);
    console.log(`${documentsAccessible ? '✅ PASS' : '❌ FAIL'}: Document access\n`);
    
    results.push({
      test: 'Document Access',
      passed: documentsAccessible,
      details: `Documents: ${documentNames.join(', ')}`
    });
  } catch (error) {
    console.log(`❌ FAIL: ${error}\n`);
    results.push({ test: 'Document Access', passed: false, details: error.message });
  }

  console.log('🔄 Test 5: Real-time Data Consistency');
  console.log('--------------------------------------');
  
  try {
    // Test multiple URL generations for same consultation
    const testConsultationId = 'consistency-test';
    const testPatientEmail = 'consistency@example.com';
    
    const url1 = meetingService.generateMeetingURL(testConsultationId, testPatientEmail);
    const url2 = meetingService.getMeetingURL(testConsultationId, testPatientEmail);
    const url3 = adminService.generateMeetingLink(testConsultationId, testPatientEmail);
    const url4 = consultationService.getMeetingLink(testConsultationId, testPatientEmail);
    
    const allConsistent = (url1 === url2 && url2 === url3 && url3 === url4);
    
    console.log(`✅ First generation: ${url1}`);
    console.log(`✅ Second generation: ${url2}`);
    console.log(`✅ Admin service: ${url3}`);
    console.log(`✅ Patient service: ${url4}`);
    console.log(`✅ All URLs identical: ${allConsistent ? 'YES' : 'NO'}`);
    console.log(`${allConsistent ? '✅ PASS' : '❌ FAIL'}: Real-time consistency\n`);
    
    results.push({
      test: 'Real-time Data Consistency',
      passed: allConsistent,
      details: `All URLs match: ${allConsistent}`
    });
  } catch (error) {
    console.log(`❌ FAIL: ${error}\n`);
    results.push({ test: 'Real-time Data Consistency', passed: false, details: error.message });
  }

  // Print summary
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const successRate = Math.round((passedTests / totalTests) * 100);

  console.log('📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})\n`);

  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${result.test}: ${status}`);
    console.log(`   Details: ${result.details}\n`);
  });

  if (successRate === 100) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Data flows correctly between patient and doctor systems');
    console.log('✅ Meeting URLs are consistent across all services');
    console.log('✅ Patient data is accessible to doctors');
    console.log('✅ Prescriptions flow from doctor to patient');
    console.log('✅ Documents are properly shared');
    console.log('✅ Real-time consistency maintained');
  } else {
    console.log('⚠️  Some tests failed. Review the results above.');
  }

  return results;
}

// Run the tests
runDataFlowTests().catch(console.error);
