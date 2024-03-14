// __mocks__/oraMock.js

// A simple mock of the ora spinner
const oraMock = {
  start: function (message) {
    console.log("Spinner started:", message);
    return this; // Allows chaining
  },
  stop: function () {
    console.log("Spinner stopped");
    return this; // Allows chaining
  },
  succeed: function (message) {
    console.log("Spinner succeeded:", message);
    return this; // Allows chaining
  },
  fail: function (message) {
    console.log("Spinner failed:", message);
    return this; // Allows chaining
  },
  info: function (message) {
    console.log("Spinner info:", message);
    return this; // Allows chaining
  },
  warn: function (message) {
    console.log("Spinner warning:", message);
    return this; // Allows chaining
  },
};

// The function that should be exported mimics the ora constructor function
// It returns the mock spinner object
export default function ora(options) {
  console.log("Ora spinner initialized with options:", options);
  return oraMock;
}
