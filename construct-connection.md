# Constructing Supabase Connection String

From your Supabase URL: `https://xzkkfwedgarqvtpkkyoh.supabase.co`

The project reference is: `xzkkfwedgarqvtpkkyoh`

## Connection String Formats to Try:

### Format 1: Direct Connection (Port 5432)
```
postgresql://postgres:kgFCWkqknPINvN2Z@db.xzkkfwedgarqvtpkkyoh.supabase.co:5432/postgres?schema=public
```

### Format 2: Pooler Connection (Port 6543) - Need Region
```
postgresql://postgres.xzkkfwedgarqvtpkkyoh:kgFCWkqknPINvN2Z@aws-0-[REGION].pooler.supabase.com:6543/postgres?schema=public
```

Common regions: us-east-1, us-west-1, eu-west-1, ap-southeast-1

Let me try to get the region or use an alternative approach.
