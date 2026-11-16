export const logMessage = (
  errorMessage: string,
  caller: string = 'unknown',
  level: 'log' | 'warn' | 'error' = 'log',
) => {
  console[level](`[${level}] [caller: ${caller}] ${errorMessage}`)
}
