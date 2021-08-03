import db from '../../database';
export default async function API$Validation(req, res) {
  console.log(req.body);

  const decodedClientData = req.body.clientDataJSON;

  // decode the clientDataJSON into a utf-8 string
  //   const utf8Decoder = new TextDecoder('utf-8');
  //   const decodedClientData = utf8Decoder.decode(
  //     Uint8Array.from(req.body.clientDataJSON.split(',')),
  //   );

  // parse the string as an object
  const clientDataObj = JSON.parse(decodedClientData);
  const challenge = Buffer.from(clientDataObj.challenge, 'base64').toString(
    'utf-8',
  );

  console.log(
    clientDataObj.challenge,
    challenge,
    db.challenge,
    db.challenge instanceof Buffer,
    challenge === db.challenge,
  );

  res.status = 200;
  res.json({ hello: 'wor;d' });
}
