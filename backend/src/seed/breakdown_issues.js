const report = require('./master_semantic_audit_report.json');

const issueTypes = {};
report.mockTests.issues.forEach(item => {
  item.issues.forEach(iss => {
    let category = 'Other';
    if (iss.includes('abnormally long')) category = 'Prompt abnormally long';
    else if (iss.includes('Fallback option match')) category = 'Fallback option';
    else if (iss.includes('HTML or email header')) category = 'Prompt has HTML/header';
    else if (iss.includes('Collision')) category = 'Collision';
    else if (iss.includes('no translation in Part')) category = 'Missing option translation';
    
    issueTypes[category] = (issueTypes[category] || 0) + 1;
  });
});

console.log('MockTest Issue Breakdown:');
console.log(JSON.stringify(issueTypes, null, 2));

console.log('\nReading Issue Breakdown:');
const readTypes = {};
report.readingExercises.issues.forEach(item => {
  item.issues.forEach(iss => {
    let cat = iss.split(':')[0];
    readTypes[cat] = (readTypes[cat] || 0) + 1;
  });
});
console.log(JSON.stringify(readTypes, null, 2));
