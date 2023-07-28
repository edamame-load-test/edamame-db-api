
import aws from '../models/aws.js';

test("Created Archive description reflects load test's unique name", () => {
  let response = aws.createArchiveDesc('example');
  expect(response).toMatch('example');
});
