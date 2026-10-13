const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log('🩺 RUNNING DOCTORS CARES FULL-STACK INTEGRATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'healthy', 'Health Check Endpoint (/health)');

    // 2. Doctors listing
    const docsRes = await fetch(`${BASE_URL}/api/v1/doctors?limit=5`);
    const docsData = await docsRes.json();
    assert(docsRes.status === 200 && Array.isArray(docsData.data) && docsData.data.length > 0, 'Public Doctors Listing (GET /api/v1/doctors)');
    const testDoctor = docsData.data[0];

    // 3. Departments listing
    const deptsRes = await fetch(`${BASE_URL}/api/v1/departments`);
    const deptsData = await deptsRes.json();
    assert(deptsRes.status === 200 && Array.isArray(deptsData.data) && deptsData.data.length >= 7, 'Medical Departments Listing (GET /api/v1/departments)');

    // 4. Doctor availability slots
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 3); // 3 days in future
    const dateStr = testDate.toISOString().split('T')[0];
    const availRes = await fetch(`${BASE_URL}/api/v1/doctors/${testDoctor._id}/availability?date=${dateStr}`);
    const availData = await availRes.json();
    assert(availRes.status === 200 && Array.isArray(availData.data.slots), 'Doctor Availability Slots Query');

    // 5. Patient Login
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient@doctorscares.com', password: 'Patient@123' }),
    });
    const loginData = await loginRes.json();
    const cookieHeader = loginRes.headers.get('set-cookie');
    const patientToken = loginData.token;

    assert(loginRes.status === 200 && patientToken, 'Patient Authentication Login');
    assert(!loginData.data.user.passwordHash, 'Security: passwordHash is NEVER exposed in API response');
    assert(cookieHeader && cookieHeader.includes('HttpOnly'), 'Security: JWT stored in HttpOnly cookie');

    // 6. Get Current User Profile (/api/v1/auth/me)
    const meRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.data.user.email === 'patient@doctorscares.com', 'Protected Profile Query (GET /api/v1/auth/me)');

    // 7. Role Authorization: Patient attempting to access Admin endpoint (/api/v1/users)
    const forbiddenRes = await fetch(`${BASE_URL}/api/v1/users`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    assert(forbiddenRes.status === 403, 'RBAC Guard: Patient accessing /api/v1/users blocked with 403 Forbidden');

    // 8. Appointment Booking & Double-Booking Prevention
    const availableSlot = availData.data.slots.find((s) => s.isAvailable);
    let bookedAppointmentId = null;

    if (availableSlot) {
      const bookRes = await fetch(`${BASE_URL}/api/v1/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${patientToken}`,
        },
        body: JSON.stringify({
          doctor: testDoctor._id,
          appointmentDate: dateStr,
          timeSlot: availableSlot.timeSlot,
          reason: 'Automated integration test consultation for health checkup',
        }),
      });
      const bookData = await bookRes.json();
      assert(bookRes.status === 201 && bookData.data._id, 'Patient Appointment Booking (POST /api/v1/appointments)');
      bookedAppointmentId = bookData.data?._id;

      // ATTEMPT DOUBLE BOOKING SAME SLOT
      const conflictRes = await fetch(`${BASE_URL}/api/v1/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${patientToken}`,
        },
        body: JSON.stringify({
          doctor: testDoctor._id,
          appointmentDate: dateStr,
          timeSlot: availableSlot.timeSlot,
          reason: 'Conflicting concurrent booking attempt',
        }),
      });
      assert(conflictRes.status === 409, 'Conflict Guard: Double booking same doctor/date/slot blocked with 409 Conflict');
    }

    // 9. Appointment Cancellation
    if (bookedAppointmentId) {
      const cancelRes = await fetch(`${BASE_URL}/api/v1/appointments/${bookedAppointmentId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${patientToken}`,
        },
        body: JSON.stringify({ cancellationReason: 'Test routine cancellation' }),
      });
      assert(cancelRes.status === 200, 'Appointment Cancellation (PATCH /api/v1/appointments/:id/cancel)');
    }

    // 10. Contact Inquiry Submission
    const contactRes = await fetch(`${BASE_URL}/api/v1/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Inquirer',
        email: 'test@inquirer.com',
        subject: 'General checkup schedule test',
        message: 'This is an automated integration test message checking contact pipeline.',
      }),
    });
    assert(contactRes.status === 201, 'Public Contact Inquiry (POST /api/v1/contact)');

    // 11. Admin Login & Dashboard Analytics
    const adminLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@doctorscares.com', password: 'Admin@123' }),
    });
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.token;
    assert(adminLoginRes.status === 200 && adminData.data.user.role === 'admin', 'Admin Login Authentication');

    const adminStatsRes = await fetch(`${BASE_URL}/api/v1/dashboard/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminStats = await adminStatsRes.json();
    assert(adminStatsRes.status === 200 && adminStats.data?.counts?.totalDoctors > 0, 'Admin Dashboard Analytics (GET /api/v1/dashboard/admin)');

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`🏁 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
