export function logger(action, details) {
  const log = {
    timestamp: new Date().toISOString(),
    action,
    details,
  };
  process.stdout.write(JSON.stringify(log) + '\n');
}