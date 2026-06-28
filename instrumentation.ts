export async function register() {
  if (process.env.NEXT_ENV === 'edge') {
    await import('./sentry.edge.config');
  }
  if (process.env.NEXT_ENV === 'nodejs') {
    await import('./sentry.server.config');
  }
}
