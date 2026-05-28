import { environment } from '@/environments/environment';

// In development, use proxy to avoid CORS issues
// In production, use the direct Keycloak URL
const baseUrl = environment.production ? environment.keycloak.url : '/keycloak/';

export const KEYCLOAK_CONFIG = {
    url: environment.keycloak.url,
    realm: environment.keycloak.realm,
    clientId: environment.keycloak.clientId,
    tokenEndpoint: `${baseUrl}realms/${environment.keycloak.realm}/protocol/openid-connect/token`,
    userInfoEndpoint: `${baseUrl}realms/${environment.keycloak.realm}/protocol/openid-connect/userinfo`,
    logoutEndpoint: `${baseUrl}realms/${environment.keycloak.realm}/protocol/openid-connect/logout`,
    masterTokenEndpoint: `${baseUrl}realms/master/protocol/openid-connect/token`,
    adminUsersEndpoint: `${baseUrl}admin/realms/${environment.keycloak.realm}/users`
};
