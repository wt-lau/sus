const DEFAULT_AUTH_SCOPES = ["openid", "profile", "email"];
const DEFAULT_LOCAL_PLAYER_ID = "local-player";
const JWKS_CACHE_TTL_MS = 5 * 60 * 1000;
const CLOCK_SKEW_SECONDS = 60;

export const OAUTH_PROTECTED_RESOURCE_PATH =
  "/.well-known/oauth-protected-resource";
export const PLAYER_ID_HEADER = "x-sus-internal-player-id";
export const PLAYER_DISPLAY_NAME_HEADER = "x-sus-internal-player-name";
export const PLAYER_SOURCE_HEADER = "x-sus-internal-player-source";

export type PlayerIdentitySource = "oauth" | "dev" | "session";

export type PlayerIdentity = {
  id: string;
  displayName: string;
  source: PlayerIdentitySource;
  subject?: string;
};

type AuthConfig = {
  issuer: string;
  audience: string;
  jwksUrl: string;
  userinfoUrl: string;
  scopes: string[];
  scopeText: string;
  resource: string;
  enabled: boolean;
  required: boolean;
  misconfigured: boolean;
};

type JwtHeader = {
  alg?: string;
  kid?: string;
  typ?: string;
};

type JwtPayload = {
  aud?: string | string[];
  email?: string;
  exp?: number;
  iss?: string;
  name?: string;
  nbf?: number;
  preferred_username?: string;
  scope?: string;
  scp?: string | string[];
  sub?: string;
};

type Jwks = {
  keys?: JwkWithKid[];
};

type JwkWithKid = JsonWebKey & {
  kid?: string;
};

const jwksCache = new Map<string, { keys: JwkWithKid[]; expiresAt: number }>();

export class AuthChallengeError extends Error {
  constructor(
    message: string,
    readonly code = "invalid_token"
  ) {
    super(message);
    this.name = "AuthChallengeError";
  }
}

export class AuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConfigurationError";
  }
}

export function getAuthConfig(env: Env, request?: Request): AuthConfig {
  const issuer = env.SUS_AUTH_ISSUER?.trim() ?? "";
  const audience = env.SUS_AUTH_AUDIENCE?.trim() ?? "";
  const jwksUrl = env.SUS_AUTH_JWKS_URL?.trim() ?? "";
  const userinfoUrl = env.SUS_AUTH_USERINFO_URL?.trim() ?? "";
  const scopes = parseScopes(env.SUS_AUTH_SCOPE);
  const scopeText = scopes.join(" ");
  const origin = request ? new URL(request.url).origin : "";
  const resource = env.SUS_AUTH_RESOURCE?.trim() || origin || audience;
  const required = env.SUS_AUTH_REQUIRED?.trim().toLowerCase() === "true";
  const enabled = Boolean(issuer && jwksUrl);

  return {
    issuer,
    audience,
    jwksUrl,
    userinfoUrl,
    scopes,
    scopeText,
    resource,
    enabled,
    required,
    misconfigured: required && !enabled
  };
}

export function getToolSecuritySchemes(env: Env) {
  const config = getAuthConfig(env);

  if (!config.enabled) {
    return [{ type: "noauth" as const }];
  }

  const oauth = { type: "oauth2" as const, scopes: config.scopes };
  return config.required ? [oauth] : [{ type: "noauth" as const }, oauth];
}

export function createProtectedResourceMetadataResponse(
  request: Request,
  env: Env
) {
  const config = getAuthConfig(env, request);

  if (!config.enabled) {
    return new Response("OAuth is not configured for this Sus MCP server.", {
      status: 404
    });
  }

  return new Response(
    JSON.stringify(
      {
        resource: config.resource,
        authorization_servers: [config.issuer],
        scopes_supported: config.scopes,
        resource_documentation: new URL("/", request.url).href
      },
      null,
      2
    ),
    {
      headers: {
        "content-type": "application/json; charset=utf-8"
      }
    }
  );
}

export function createAuthErrorResponse(
  request: Request,
  env: Env,
  error: unknown
) {
  if (error instanceof AuthConfigurationError) {
    return new Response(error.message, { status: 500 });
  }

  const challengeError =
    error instanceof AuthChallengeError
      ? error
      : new AuthChallengeError("Authentication is required.");

  return new Response(
    JSON.stringify(
      {
        error: challengeError.code,
        error_description: challengeError.message
      },
      null,
      2
    ),
    {
      status: 401,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "www-authenticate": buildWwwAuthenticateHeader(
          request,
          env,
          challengeError
        )
      }
    }
  );
}

export async function resolvePlayerIdentity(
  request: Request,
  env: Env
): Promise<PlayerIdentity> {
  const config = getAuthConfig(env, request);

  if (config.misconfigured) {
    throw new AuthConfigurationError(
      "SUS_AUTH_REQUIRED is true, but SUS_AUTH_ISSUER or SUS_AUTH_JWKS_URL is missing."
    );
  }

  const token = extractBearerToken(request);
  if (token && config.enabled) {
    const tokenClaims = await resolveTokenClaims(token, config);
    const subject = tokenClaims.sub;
    if (!subject) {
      throw new AuthChallengeError("OAuth token is missing the subject claim.");
    }

    const id = await hashedPlayerId(config.issuer, subject);
    return {
      id,
      displayName: resolveDisplayName(tokenClaims, id),
      source: "oauth",
      subject
    };
  }

  if (config.required) {
    throw new AuthChallengeError("Sign in to the Sus ChatGPT app to continue.");
  }

  return resolveLocalIdentity(request);
}

export function playerDurableObjectName(player: PlayerIdentity) {
  return normalizeName(`player-${player.id}`, 256);
}

export function requestWithPlayerIdentity(
  request: Request,
  player: PlayerIdentity
) {
  const headers = new Headers(request.headers);
  headers.set(PLAYER_ID_HEADER, player.id);
  headers.set(PLAYER_DISPLAY_NAME_HEADER, player.displayName);
  headers.set(PLAYER_SOURCE_HEADER, player.source);
  headers.delete("authorization");

  return new Request(request, { headers });
}

export function readTrustedPlayerIdentity(
  request: Request
): PlayerIdentity | null {
  const id = request.headers.get(PLAYER_ID_HEADER);
  const displayName = request.headers.get(PLAYER_DISPLAY_NAME_HEADER);
  const source = request.headers.get(PLAYER_SOURCE_HEADER);

  if (!id || !displayName || !isPlayerSource(source)) return null;

  return {
    id,
    displayName,
    source
  };
}

function buildWwwAuthenticateHeader(
  request: Request,
  env: Env,
  error: AuthChallengeError
) {
  const metadataUrl = new URL(OAUTH_PROTECTED_RESOURCE_PATH, request.url);
  const config = getAuthConfig(env, request);
  return [
    `Bearer resource_metadata="${metadataUrl.href}"`,
    `scope="${escapeAuthParam(config.scopeText)}"`,
    `error="${escapeAuthParam(error.code)}"`,
    `error_description="${escapeAuthParam(error.message)}"`
  ].join(", ");
}

function extractBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

function isCompactJwt(token: string) {
  return token.split(".").length === 3;
}

async function verifyJwt(token: string, config: AuthConfig) {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new AuthChallengeError("OAuth token must be a compact JWT.");
  }

  const header = decodeJwtPart<JwtHeader>(encodedHeader);
  const payload = decodeJwtPart<JwtPayload>(encodedPayload);

  if (header.alg !== "RS256") {
    throw new AuthChallengeError("OAuth token must use RS256 signing.");
  }

  const jwk = await getJwkForHeader(config.jwksUrl, header);
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    false,
    ["verify"]
  );
  const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  const signature = decodeBase64Url(encodedSignature);
  const verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    signature,
    data
  );

  if (!verified) {
    throw new AuthChallengeError("OAuth token signature is invalid.");
  }

  validateJwtClaims(payload, config);
  return payload;
}

async function resolveTokenClaims(token: string, config: AuthConfig) {
  if (isCompactJwt(token)) {
    const payload = await verifyJwt(token, config);
    const userinfo = await fetchUserInfo(token, config);
    return {
      ...payload,
      ...userinfo,
      sub: payload.sub ?? userinfo?.sub
    };
  }

  const userinfo = await fetchUserInfo(token, config);
  if (!userinfo?.sub) {
    throw new AuthChallengeError("OAuth access token could not be verified.");
  }

  return userinfo;
}

async function getJwkForHeader(jwksUrl: string, header: JwtHeader) {
  const keys = await getJwks(jwksUrl);
  const matchingKey = header.kid
    ? keys.find((key) => key.kid === header.kid)
    : keys.length === 1
      ? keys[0]
      : undefined;

  if (!matchingKey) {
    throw new AuthChallengeError("OAuth token signing key was not found.");
  }

  return matchingKey;
}

async function getJwks(jwksUrl: string) {
  const cached = jwksCache.get(jwksUrl);
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.keys;

  const response = await fetch(jwksUrl, {
    headers: { accept: "application/json" }
  });
  if (!response.ok) {
    throw new AuthChallengeError("OAuth signing keys could not be loaded.");
  }

  const jwks = (await response.json()) as Jwks;
  if (!Array.isArray(jwks.keys)) {
    throw new AuthChallengeError("OAuth signing keys response is invalid.");
  }

  jwksCache.set(jwksUrl, {
    keys: jwks.keys,
    expiresAt: now + JWKS_CACHE_TTL_MS
  });
  return jwks.keys;
}

function validateJwtClaims(payload: JwtPayload, config: AuthConfig) {
  const now = Math.floor(Date.now() / 1000);

  if (payload.iss !== config.issuer) {
    throw new AuthChallengeError("OAuth token issuer is not trusted.");
  }

  if (config.audience && !audienceMatches(payload.aud, config.audience)) {
    throw new AuthChallengeError("OAuth token audience does not match Sus.");
  }

  if (!payload.exp || payload.exp + CLOCK_SKEW_SECONDS <= now) {
    throw new AuthChallengeError("OAuth token has expired.");
  }

  if (payload.nbf && payload.nbf - CLOCK_SKEW_SECONDS > now) {
    throw new AuthChallengeError("OAuth token is not valid yet.");
  }

  if (!scopeMatches(payload, config.scopes)) {
    throw new AuthChallengeError("OAuth token is missing required Sus scopes.");
  }
}

function audienceMatches(audience: JwtPayload["aud"], expected: string) {
  if (Array.isArray(audience)) return audience.includes(expected);
  return audience === expected;
}

function scopeMatches(payload: JwtPayload, requiredScopes: string[]) {
  const scopes = new Set<string>();

  if (typeof payload.scope === "string") {
    for (const scope of payload.scope.split(/\s+/)) scopes.add(scope);
  }

  if (Array.isArray(payload.scp)) {
    for (const scope of payload.scp) scopes.add(scope);
  } else if (typeof payload.scp === "string") {
    for (const scope of payload.scp.split(/\s+/)) scopes.add(scope);
  }

  return requiredScopes.every((scope) => scopes.has(scope));
}

async function fetchUserInfo(token: string, config: AuthConfig) {
  if (!config.userinfoUrl) return null;

  const response = await fetch(config.userinfoUrl, {
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) return null;

  return (await response.json()) as JwtPayload;
}

async function hashedPlayerId(issuer: string, subject: string) {
  const bytes = new TextEncoder().encode(`${issuer}\0${subject}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return `usr_${toBase64Url(new Uint8Array(digest)).slice(0, 32)}`;
}

function resolveLocalIdentity(request: Request): PlayerIdentity {
  const url = new URL(request.url);
  const explicitUser =
    request.headers.get("x-sus-user-id") ?? url.searchParams.get("user");
  const displayName =
    request.headers.get("x-sus-display-name") ??
    url.searchParams.get("displayName");

  if (explicitUser?.trim()) {
    const id = `dev_${normalizeName(explicitUser, 80)}`;
    return {
      id,
      displayName: cleanDisplayName(displayName) || "Local player",
      source: "dev"
    };
  }

  const session =
    request.headers.get("mcp-session-id") ??
    request.headers.get("x-sus-session-id") ??
    url.searchParams.get("session") ??
    DEFAULT_LOCAL_PLAYER_ID;
  const id = `session_${normalizeName(session, 80)}`;

  return {
    id,
    displayName: cleanDisplayName(displayName) || "Guest player",
    source: "session"
  };
}

function resolveDisplayName(payload: JwtPayload, id: string) {
  return (
    cleanDisplayName(payload.preferred_username) ||
    cleanDisplayName(payload.name) ||
    cleanDisplayName(payload.email?.split("@")[0]) ||
    `Player ${id.slice(-6)}`
  );
}

function decodeJwtPart<T>(value: string): T {
  const decoded = new TextDecoder().decode(decodeBase64Url(value));
  return JSON.parse(decoded) as T;
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function normalizeName(value: string | null | undefined, maxLength: number) {
  const normalized = value
    ?.trim()
    .replace(/[^a-zA-Z0-9._:-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, maxLength);

  return normalized || DEFAULT_LOCAL_PLAYER_ID;
}

function cleanDisplayName(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ").slice(0, 80) ?? "";
}

function escapeAuthParam(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function parseScopes(value: string | null | undefined) {
  const scopes = value?.trim().split(/\s+/).filter(Boolean) ?? [];
  return scopes.length > 0 ? scopes : DEFAULT_AUTH_SCOPES;
}

function isPlayerSource(value: string | null): value is PlayerIdentitySource {
  return value === "oauth" || value === "dev" || value === "session";
}
