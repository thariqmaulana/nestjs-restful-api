# Contact API Spec

## Create Contact

Endpoint : POST /api/contacts

Headers :
- Authorization : token

Request Body : 

```json
{
  "first_name" : "thariq",
  "last_name" : "maulana",
  "email" : "thariq@example.com",
  "phone" : "080012341234"
}
```

Response Body :

```json
{
  "data" : {
    "id" : 1,
    "first_name" : "thariq",
    "last_name" : "maulana",
    "email" : "thariq@example.com",
    "phone" : "080012341234"
  }
}
```

## Get Contact

Endpoint : POST /api/contacts

Headers :
- Authorization : token

## Update Contact

Endpoint : POST /api/contacts

Headers :
- Authorization : token

## Remove Contact

Endpoint : POST /api/contacts

Headers :
- Authorization : token

## Search Contact

Endpoint : POST /api/contacts

Headers :
- Authorization : token