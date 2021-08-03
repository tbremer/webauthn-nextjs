import { STATUS_CODES } from 'http';
import crypto from 'crypto';
import React from 'react';

import database from '../database';

// import { CBOR } from 'cbor-redux';

function arrayBufferToString(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

export default function Register({ cryptids }) {
  async function click() {
    const foo = await create(cryptids);
    const body = JSON.stringify({
      attestationObject: arrayBufferToString(foo.response.attestationObject),
      clientDataJSON: arrayBufferToString(foo.response.clientDataJSON),
    });

    console.log(JSON.parse(JSON.parse(body).clientDataJSON));

    const resp = await fetch('/api/validation', {
      method: 'POST',
      body,
      headers: {
        'content-type': 'application/json',
      },
    });

    console.log(resp);
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

  database.challenge = crypto.randomBytes(32);

  return { props: { cryptids: database.challenge.toString('base64') } };
}

function create(challengeString) {
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
    challenge: Uint8Array.from(challengeString, (c) => c.charCodeAt(0)),

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

    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'discouraged',
    },
  };

  return navigator.credentials.create({ publicKey: creds });
}
