# Authorization System Integration Test

## Testing UI Authorization Features

### Test Script for Browser Console

```javascript
// Run this in the browser console after logging in as different users

// Test 1: Check if authorization service is loaded
console.log('=== Authorization Service Test ===');
console.log('Current user:', window.localStorage.getItem('currentUser'));

// Test 2: Check UI elements visibility
const testUIElements = () => {
  console.log('=== UI Elements Visibility Test ===');
  
  // Check debug tools visibility
  const debugTools = document.querySelector('[data-testid="debug-tools"]');
  console.log('Debug Tools visible:', debugTools ? 'YES' : 'NO');
  
  // Check edit buttons in submissions
  const editButtons = document.querySelectorAll('button:contains("Sửa")');
  console.log('Edit buttons count:', editButtons.length);
  
  // Check delete buttons
  const deleteButtons = document.querySelectorAll('button:contains("Xóa")');
  console.log('Delete buttons count:', deleteButtons.length);
  
  // Check approve/reject buttons
  const approveButtons = document.querySelectorAll('button:contains("Duyệt")');
  const rejectButtons = document.querySelectorAll('button:contains("Hủy")');
  console.log('Approve buttons count:', approveButtons.length);
  console.log('Reject buttons count:', rejectButtons.length);
  
  // Check status selectors
  const statusSelectors = document.querySelectorAll('[role="combobox"]');
  console.log('Status selectors count:', statusSelectors.length);
};

// Test 3: Role-based access simulation
const testRoleAccess = (userRole) => {
  console.log(`=== Testing ${userRole} Access ===`);
  
  // Simulate different user roles
  const testUser = {
    id: 'test-user-' + userRole.toLowerCase().replace(' ', '-'),
    username: 'test-' + userRole.toLowerCase().replace(' ', ''),
    role: userRole,
    email: `test-${userRole.toLowerCase().replace(' ', '')}@ankun.studio`
  };
  
  console.log('Test user:', testUser);
  
  // Store test user
  localStorage.setItem('currentUser', JSON.stringify(testUser));
  
  // Reload to apply changes
  setTimeout(() => {
    console.log('User role changed. Reloading page to test UI...');
    window.location.reload();
  }, 1000);
};

// Run UI test immediately
testUIElements();

// Provide test functions for manual testing
window.testRoleAccess = testRoleAccess;
window.testUIElements = testUIElements;

console.log('=== Test Functions Available ===');
console.log('- testRoleAccess("Label Manager") - Test as Label Manager');
console.log('- testRoleAccess("Artist") - Test as Artist');
console.log('- testUIElements() - Check current UI elements');
```

### Manual Test Cases

#### Test Case 1: Label Manager Access

1. Login as Label Manager
2. Expected UI Elements:
   - ✅ Debug Tools visible
   - ✅ All edit buttons visible
   - ✅ All delete buttons visible  
   - ✅ All approve/reject buttons visible
   - ✅ Status selectors visible
   - ✅ Can view all submissions
   - ✅ Can access statistics of all users

#### Test Case 2: Artist Access

1. Login as Artist
2. Expected UI Elements:
   - ❌ Debug Tools hidden
   - ✅ Edit buttons only for own pending submissions
   - ❌ No delete buttons
   - ❌ No approve/reject buttons
   - ❌ No status selectors
   - ✅ Can view only own submissions
   - ✅ Can access only own statistics

#### Test Case 3: Unauthorized Access

1. Logout or access without credentials
2. Expected behavior:
   - ❌ No access to sensitive areas
   - ❌ API calls return 401/403
   - ✅ Redirected to login

### API Endpoint Testing

#### Authorization API Test Commands

```bash
# Test as Label Manager
curl -X GET "http://localhost:3000/api/submissions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer LABEL_MANAGER_TOKEN"

# Test as Artist
curl -X GET "http://localhost:3000/api/submissions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ARTIST_TOKEN"

# Test approve/reject (Label Manager only)
curl -X POST "http://localhost:3000/api/submissions/approve-reject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer LABEL_MANAGER_TOKEN" \
  -d '{"submissionId": "test-id", "action": "approve"}'

# Test statistics (filtered by user role)  
curl -X GET "http://localhost:3000/api/submissions/statistics" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN"
```

### Expected Results Summary

| Feature | Label Manager | Artist | Unauthorized |
|---------|---------------|--------|--------------|
| View All Submissions | ✅ | ❌ | ❌ |
| View Own Submissions | ✅ | ✅ | ❌ |
| Edit Any Submission | ✅ | ❌ | ❌ |
| Edit Own Pending | ✅ | ✅ | ❌ |
| Delete Submissions | ✅ | ❌ | ❌ |
| Approve/Reject | ✅ | ❌ | ❌ |
| Debug Tools | ✅ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ |
| Full Statistics | ✅ | ❌ | ❌ |
| Own Statistics | ✅ | ✅ | ❌ |

### Integration Status

- ✅ AuthorizationService created with all permission methods
- ✅ API endpoints updated with authorization checks
- ✅ UI components updated with role-based rendering
- ✅ Hooks created for easy authorization checks
- ✅ Test scripts available for validation
- ⏳ Full integration testing in progress
- ⏳ Edge case handling and error scenarios
- ⏳ Performance optimization for authorization checks

### Next Steps

1. Complete integration testing with real data
2. Handle edge cases and error scenarios
3. Optimize performance for authorization checks
4. Add comprehensive logging for authorization decisions
5. Create documentation for developers
