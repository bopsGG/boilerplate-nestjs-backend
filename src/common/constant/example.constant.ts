import { AttachmentAllowedMimeTypesConstant } from '.';

const oneHour = 3600;
const fifteenMinutes = 900;
const currentTimestamp = Math.floor(Date.now() / 1000);
const expireIn = currentTimestamp + oneHour + fifteenMinutes;

const currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);

const html = `<!DOCTYPE html>
<html>
<head>
<title>Sleep</title>
</head>
<body>
<h1>Sleep</h1>
<p>Sleep in the morning</p>
</body>
</html>
`;

export const ApiPropertyExampleConstant = {
  ADDRESS:
    'Department of Health, Ministry of Public Health, 88/22 Tiwanon Rd, Mueang, Mueang Nonthaburi, Nonthaburi 11000, Thailand.',
  ACCESS_TOKEN: 'your-access-token',
  BASE_64: Buffer.from(html).toString('base64'),
  CURRENT_DATE: currentDate,
  CURRENT_TIME: currentTimestamp,
  EMAIL_ADDRESS: 'your-email@example.com',
  EXPIRE_IN: expireIn,
  FILE_MIME_TYPE: AttachmentAllowedMimeTypesConstant.PDF,
  FILE_NAME: '4d82dd2a-f4c0-4ac8-9c12-4050e08e9a89.pdf',
  HTML: html,
  IAL_LEVEL: 2.1,
  IDENTIFICATION_ID: '9999999999999',
  IP_ADDRESS: '127.0.0.1',
  KEY: 'your-key',
  KEYWORD_FOR_SEARCH: 'your-keyword-for-search',
  NAME: 'your-first-name-and-your-last-name',
  NANO_ID: '63326c6240a0d8c4b69ec04f',
  NOTE: 'your-note',
  OTP: '012345',
  PASSWORD: 'your-password',
  PHONE_NO: '+66812345678',
  REFRESH_TOKEN: 'your-refresh-token',
  USERNAME: 'your-username',
  UUID: '179f3bdc-1744-440c-92a4-b3dc76575d9b',
};
