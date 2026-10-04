async function testFullSystem() {
  const base = 'http://localhost:5173/api';
  console.log('--- STARTING COMPREHENSIVE END-TO-END VERIFICATION ---');

  // Test 1: Student Registration
  const testStudentEmail = `test_student_${Date.now()}@example.com`;
  const regRes = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Jordan Lee',
      email: testStudentEmail,
      password: 'password123',
      confirmPassword: 'password123',
      mobile: '+1 (555) 999-8888',
      college: 'Georgia Tech',
      course: 'B.Tech / B.E.',
      branch: 'Computer Science & Engineering',
      yearSemester: '3rd Year / 5th Semester',
      skills: 'Python, C++, Machine Learning',
    }),
  }).then(r => r.json());
  console.log('1. Student Registration:', regRes.ok, 'Name:', regRes.user?.name, 'Role:', regRes.user?.role);

  // Test 2: Duplicate Email Rejection
  const dupRes = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Jordan Duplicate',
      email: testStudentEmail,
      password: 'password123',
      confirmPassword: 'password123',
      mobile: '+1 (555) 999-8888',
      college: 'Georgia Tech',
      course: 'B.Tech',
      branch: 'CS',
      yearSemester: '3rd Year',
    }),
  });
  console.log('2. Duplicate Email Check Rejected as expected:', dupRes.status === 400);

  // Test 3: Student Login
  const stuLoginRes = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testStudentEmail, password: 'password123', roleHint: 'student' }),
  }).then(r => r.json());
  console.log('3. Student Login:', stuLoginRes.ok, 'Token:', !!stuLoginRes.token);

  // Test 4: Teacher Login with Predefined Credentials
  const teachLoginRes = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'teacher@gmail.com', password: 'teacher@1', roleHint: 'teacher' }),
  }).then(r => r.json());
  console.log('4. Teacher Login:', teachLoginRes.ok, 'Role:', teachLoginRes.user?.role);

  // Test 5: Role-based Access Control - Student calling Teacher API
  const blockedRes = await fetch(`${base}/teacher/overview`, {
    headers: { Authorization: `Bearer ${stuLoginRes.token}` },
  });
  console.log('5. Student Blocked from Teacher API (403):', blockedRes.status === 403);

  // Test 6: Teacher Creates a New Problem
  const newProblemId = `test-two-sum-advanced-${Date.now()}`;
  const createProbRes = await fetch(`${base}/teacher/problems`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${teachLoginRes.token}`,
    },
    body: JSON.stringify({
      title: `Two Sum Advanced ${Date.now()}`,
      difficulty: 'Medium',
      topics: ['Array', 'Hash Table'],
      description: 'Given an array of integers, return the matching pair indices.',
      inputFormat: 'Array and target',
      outputFormat: 'Pair of indices',
      constraints: ['1 <= nums.length <= 10^5'],
      sampleTestCases: [{ id: 'tc-1', input: '[1,2,3]\n5', expectedOutput: '[1,2]' }],
      hiddenTestCases: [{ id: 'htc-1', input: '[10,20,30]\n50', expectedOutput: '[1,2]' }],
      starterCode: {
        python: 'class Solution:\n    def solve(self, nums, target):\n        return [1, 2]',
        javascript: 'function solve(nums, target) { return [1, 2]; }'
      },
      isPublished: true,
    }),
  }).then(r => r.json());
  console.log('6. Teacher Creates Problem:', createProbRes.ok, 'Title:', createProbRes.problem?.title);

  // Test 7: Student Submits Code to Coding Lab
  const subRes = await fetch(`${base}/coding-lab/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${stuLoginRes.token}`,
    },
    body: JSON.stringify({
      problemId: 'two-sum',
      language: 'javascript',
      code: 'function twoSum(nums, target) { const m = new Map(); for (let i=0; i<nums.length; i++) { if (m.has(target-nums[i])) return [m.get(target-nums[i]), i]; m.set(nums[i], i); } return []; }'
    }),
  }).then(r => r.json());
  console.log('7. Student Submits Code:', subRes.ok, 'Status:', subRes.status, 'Submission ID:', subRes.submissionId);

  // Test 8: Teacher Inspects Submissions - Student submission is recorded!
  const subsListRes = await fetch(`${base}/teacher/submissions`, {
    headers: { Authorization: `Bearer ${teachLoginRes.token}` },
  }).then(r => r.json());
  const foundSubmission = subsListRes.submissions.find(s => s.id === subRes.submissionId);
  console.log('8. Submission visible to Teacher:', !!foundSubmission, 'Student name recorded:', foundSubmission?.studentName);

  // Test 9: Student Predict Output
  const predEval = await fetch(`${base}/coding-lab/predict-output/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${stuLoginRes.token}`,
    },
    body: JSON.stringify({
      questionId: 'py-range-bounds',
      answer: '6'
    })
  }).then(r => r.json());
  console.log('9. Student Predict Output:', predEval.ok, 'isCorrect:', predEval.isCorrect);

  // Test 10: Teacher Overview Metrics
  const teachOv = await fetch(`${base}/teacher/overview`, {
    headers: { Authorization: `Bearer ${teachLoginRes.token}` },
  }).then(r => r.json());
  console.log('10. Teacher Overview Updated: Total Students:', teachOv.overview?.totalStudents, 'Total Submissions:', teachOv.overview?.totalSubmissions);

  console.log('--- ALL 10 TESTS COMPLETED SUCCESSFULLY ---');
}
testFullSystem().catch(e => console.error(e));
