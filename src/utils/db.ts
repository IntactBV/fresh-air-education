// src/utils/db.ts
import { Pool } from 'pg';

const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const config = {
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: true,
        ca: `-----BEGIN CERTIFICATE-----
MIIEUDCCArigAwIBAgIUc2Ov5PXIJ1fH6vPWo+hQpV9XZx4wDQYJKoZIhvcNAQEM
BQAwQDE+MDwGA1UEAww1MTdlMTI5NTEtODllMy00MjQ4LWIxZGYtYjJiOWM3NjU1
MzZmIEdFTiAxIFByb2plY3QgQ0EwHhcNMjUxMTEzMTEzNTE1WhcNMzUxMTExMTEz
NTE1WjBAMT4wPAYDVQQDDDUxN2UxMjk1MS04OWUzLTQyNDgtYjFkZi1iMmI5Yzc2
NTUzNmYgR0VOIDEgUHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCC
AYoCggGBALmGBVCpAuBcAAmTrjHs8ePAodqLLM9zjWf7tU6wt+mXrp6Et7VNEk+X
YKGzbGohJGjlhg790MLu0KKEcuvgVCVn1zQiJMt69NUgiUOfYNBjAXUEnd5yo5sv
l77j9+EXjPoDI9rJdvfg/jtJWLoSLhFkyhghVTme1fafMRTqRxY/uTPYYFomN/vX
Sm5G8nJ25NDSS4c1tzIQuDzA/la7rkCrxYTEMzSUI/BURAJF8p+y7juHG8BcSI8k
IqSDthG+E9mdInMZ0SvQCQCvl3jGSQfLTpwUg6diu6ZEd2EU7sVQTsbhx1xE6LNq
EL1BsGG9wIXSFjQRI8gQpGIjAlEqkY73WD9UZ9r3vJMmRCFttG11yDNCq76Kg/35
nysFBte3uWZqFv3LC2+mzdGvnMqkqI2Do8LyZ1WPMqgN+xOo84+1cfmh9lgGAvnx
lxK5NhgzENqi3Lp7XE4owQ2qCJWCdRSzH+9cEzFGsNwhAziWE6w3nrw7nR/bHA3G
1H05kdoJQQIDAQABo0IwQDAdBgNVHQ4EFgQULfNBpHhiJbxTCYTlQuvo8QNv670w
EgYDVR0TAQH/BAgwBgEB/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQAD
ggGBACzgcEW+YJT4XdBw0vM00tB1FVl4ULvYfS/ZENVu4LULsNit4MWKGYCE1NSy
sMJKHbttVpIKyM9xytwOxsAwYfv6cEbQbibphM9qdm8o+mAFfCn2M40FSCiP+THP
n4AEr0Nl8C2B5DvBPuPqM+TfghPyX025432F3tSTxqQn1B1NT4ujvhafo/pGgvyI
i1TzJUpqwZQ6rrDWrtHf2iiARaf1SNbzih3NiiY28uvJa+6TnHEZUTMSwVy3PPlw
p0S93gcr0myIW0nlFOhZjDB54XVE/FO6Mp7ruDa/iJoMLiF7A11Ebusthv3j4NSG
Pxnpx4UCk1hajZ+YzgBaXce6h4O812JdZz8MKUimCWVf4GMgDi7LO2uYU20sL7oi
oJ5Y01nQj1re9+u8ZsTjHZKgnrxGY27j2CbTy5Ra8lqqUboAKMPlSmd1rqVBgnkQ
uaTn12Mvatv3+mFEBHWi25XhCNfslmYd/XAfuzhT5tiCPt3T1PZycCmsksh8FSkY
uk1BPA==
-----END CERTIFICATE-----`,
    },
};

export const db = new Pool(config);



db.on('error', (err) => {
  console.error('Eroare la conexiunea cu baza de date:', err);
});
