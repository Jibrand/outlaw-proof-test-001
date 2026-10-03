export function validateRequest(request) {
  if (typeof request.input !== 'number') {
    return { valid: false, reason: 'Input is not a number' };
  }
  if (typeof request.operand !== 'number') {
    return { valid: false, reason: 'Operand is not a number' };
  }
  if (request.operation !== 'multiply') {
    return { valid: false, reason: 'Unsupported operation' };
  }
  return { valid: true };
}

export function validateResult(request, result) {
  let expected = request.input * request.operand;
  return {
    test_name: "Multiplication Check",
    timestamp: new Date().toISOString(),
    status: expected === result ? "PASS" : "FAIL",
    assertions: {
      input_is_number: typeof request.input === 'number',
      expected_value: expected,
      actual_value: result,
      schema_valid: true
    }
  };
}
