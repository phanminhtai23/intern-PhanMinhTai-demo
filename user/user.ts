import { api } from "encore.dev/api";
// import { query, transaction } from "../../db/db";


export const getHome = api (
    {
        expose: true,
        method: "GET",
        path: "/home",
    }, async (): Promise<{ message: string }> => {
        return { message: "hello from The Farm" };
    }
);

const logtoEndpoint = 'https://p3lzbm.logto.app/';
const tokenEndpoint = `${logtoEndpoint}/oidc/token`;
const applicationId = 'sae9cz5b470nhz3ujbxjh';
const applicationSecret = 'lIIMJ3fnXbjwcIK5XHifiFSXhP6QvAvv';

const fetchAccessToken = async () => {
  return await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${applicationId}:${applicationSecret}`).toString(
        'base64'
      )}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      resource: 'https://shopping.api',
      scope: 'read:products write:products',
    }).toString(),
  });
};