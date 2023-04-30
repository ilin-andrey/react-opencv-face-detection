export function logInfo({ message }: { message: string }) {
  console.log(message);
}

export function logError({ message }: { message: string }) {
  console.error(message);
}
