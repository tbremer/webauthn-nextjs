import { STATUS_CODES } from 'http';
import crypto from 'crypto';
import React from 'react';
export default function Register({ cryptids }) {
  async function click() {
    const foo = await create(cryptids);

    console.log(foo);
  }

  return (
    <>
      <button type="button" onClick={click}>
        Login
      </button>
      <pre>{JSON.stringify(cryptids)}</pre>
    </>
  );
}

export async function getServerSideProps({ req, res }) {
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers['x-real-ip'] !== process.env.VALID_IP
  ) {
    res.status = 403;
    res.end(STATUS_CODES[403]);
    return { props: {} };
  }

  return {
    props: {
      cryptids: crypto.randomBytes(32).toString('base64'),
    },
  };
}

async function create(challengeString) {
  // Create Creds:
  const creds = {
    // https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions/rp
    rp: {
      name: 'Friendly Name',
    },

    // https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions/user
    user: {
      displayName: 'Tom Bremer',
      id: window.crypto.getRandomValues(new Uint8Array(32)),
      name: 'bremert@wwt.com',
    },

    // https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions/challenge
    challenge: Uint8Array.from(atob(challengeString), (c) => c.charCodeAt(0)),

    // https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions/pubKeyCredParams
    pubKeyCredParams: [
      // We would like an elliptic curve to be used if possible
      {
        type: 'public-key',
        alg: -7,
      },
      // If not, then we will fallback on an RSA algorithm
      {
        type: 'public-key',
        alg: -37,
      },
    ],

    authenticatorSelection: { authenticatorAttachment: 'platform' },
  };

  return navigator.credentials.create({ publicKey: creds });
}
