const REQUIRED_PUBLIC_ENV_VARS = ['NEXT_PUBLIC_LIVEKIT_URL'] as const
const REQUIRED_SERVER_ENV_VARS = ['DATABASE_URL', 'LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET'] as const

export type RequiredPublicEnvVar = (typeof REQUIRED_PUBLIC_ENV_VARS)[number]
export type RequiredServerEnvVar = (typeof REQUIRED_SERVER_ENV_VARS)[number]

function isMissing(value: string | undefined): boolean {
  return !value || value.trim().length === 0
}

export function getMissingRequiredEnvVars(): {
  server: RequiredServerEnvVar[]
  public: RequiredPublicEnvVar[]
} {
  const missingServer = REQUIRED_SERVER_ENV_VARS.filter((key) => isMissing(process.env[key]))
  const missingPublic = REQUIRED_PUBLIC_ENV_VARS.filter((key) => isMissing(process.env[key]))

  return {
    server: missingServer,
    public: missingPublic,
  }
}

export function hasRequiredEnvVars(): boolean {
  const missing = getMissingRequiredEnvVars()
  return missing.server.length === 0 && missing.public.length === 0
}

export function requireServerEnvVar(key: RequiredServerEnvVar): string {
  const value = process.env[key]
  if (isMissing(value)) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}
