# Debugging Element Creation

## Steps to debug:

1. Open the presentation editor at `http://localhost:3000/presentations/1`
2. Open browser console (F12)
3. Try clicking "Text" button in toolbar
4. Check console for these messages:
   - "Creating element:" - shows the attempt
   - "Sending payload:" - shows what's being sent
   - "Response status:" - shows if API call succeeded
   - "Element created successfully:" - shows if it worked

## Expected console output (success):
```
Creating element: {frameId: 1, data: {…}}
Sending payload: {frame: 1, element_type: "TEXT", ...}
Response status: 201
Element created successfully: {id: 5, element_type: "TEXT", ...}
```

## Common issues:

### 1. "Cannot create element: no edit permission"
- User doesn't have edit rights
- Check `current_user_permission` in presentation data

### 2. Response status 400/422
- Invalid payload format
- Check that position and content are valid JSON strings

### 3. Response status 401
- Authentication token missing or expired
- Re-login

### 4. Response status 404
- Frame doesn't exist
- Check frame ID is correct

## Manual test:

Run in browser console:
```javascript
// Get the context
const { createElement, selectedFrame } = window.presentationContext;

// Try creating an element
createElement(selectedFrame.id, {
  element_type: 'TEXT',
  position: JSON.stringify({x: 100, y: 100, width: 200, height: 100, rotation: 0, z_index: 1}),
  content: JSON.stringify({text: 'Test', fontSize: 24, color: '#000'})
});
```
