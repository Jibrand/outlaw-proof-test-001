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

export function validateResultPhase1(request, result) {
  return {
    test_name: "Multiplication Check",
    timestamp: new Date().toISOString(),
    status: (result === 1000) ? "PASS" : "FAIL",
    assertions: {
      input_is_number: typeof request.input === 'number',
      expected_value: 1000,
      actual_value: result,
      schema_valid: true
    }
  };
}

export function validateResultPhase2(request, errorCaptured) {
  return {
    test_name: "Multiplication Fault Check",
    timestamp: new Date().toISOString(),
    status: "FAIL",
    assertions: {
      input_is_number: typeof request.input === 'number',
      expected_value: null,
      actual_value: null,
      schema_valid: false,
      fault_caught: errorCaptured !== null
    }
  };
}

export function validateResultPhase3(request, result) {
  return {
    test_name: "Multiplication Recovery Check",
    timestamp: new Date().toISOString(),
    status: (result === 1000) ? "PASS" : "FAIL",
    assertions: {
      input_is_number: typeof request.input === 'number',
      expected_value: 1000,
      actual_value: result,
      schema_valid: true
    }
  };
}
