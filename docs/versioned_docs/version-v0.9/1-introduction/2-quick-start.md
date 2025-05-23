---
title: Quick Start
---

# Quick Start

## Install DynamoDB Toolbox using aws-sdk v3 (>=v0.8.0) (recommended)

Using your favorite package manager, install DynamoDB Toolbox and aws-sdk v3 in your project by running one of the following commands:

```bash
# npm
npm i dynamodb-toolbox
npm install @aws-sdk/lib-dynamodb @aws-sdk/client-dynamodb

# yarn
yarn add dynamodb-toolbox
yarn add @aws-sdk/lib-dynamodb @aws-sdk/client-dynamodb

```

## Install DynamoDB Toolbox using aws-sdk v2 (\<v0.8.0)

Using your favorite package manager, install DynamoDB Toolbox and aws-sdk v2 in your project by running one of the following commands:

```bash
# npm
npm i dynamodb-toolbox
npm install aws-sdk

# yarn
yarn add dynamodb-toolbox
yarn add aws-sdk

```

## Add to your code

The `dynamodb-toolbox` package exports `Table` and `Entity` classes. Import or require them into your code as follows:

```javascript title="JavaScript"
const { Table, Entity } = require('dynamodb-toolbox')
```

```typescript title="TypeScript"
import { Table, Entity } from 'dynamodb-toolbox'
```

## Load the DocumentClient using aws-sdk v3 (>=v0.8.0)

```typescript title="TypeScript"
import {
  DynamoDB,
  DynamoDBClient
} from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const marshallOptions = {
  // Specify your client options as usual
  convertEmptyValues: false
}

const translateConfig = { marshallOptions }

export const DocumentClient = DynamoDBDocumentClient.from(
  new DynamoDBClient(),
  translateConfig
)
```

## Load the DocumentClient using aws-sdk v2 (\<v0.8.0)

```typescript title="TypeScript"
import DynamoDB from 'aws-sdk/clients/dynamodb'

const DocumentClient = new DynamoDB.DocumentClient({
  // Specify your client options as usual
  convertEmptyValues: false
})
```

## Define a Table

```typescript
// Instantiate a table
const MyTable = new Table({
  // Specify table name (used by DynamoDB)
  name: 'my-table',

  // Define partition and sort keys
  partitionKey: 'pk',
  sortKey: 'sk',

  // Add the DocumentClient
  DocumentClient
})
```

## Define an Entity

```typescript
const Customer = new Entity({
  // Specify entity name
  name: 'Customer',

  // Define attributes
  attributes: {
    id: { partitionKey: true }, // flag as partitionKey
    sk: { hidden: true, sortKey: true }, // flag as sortKey and mark hidden
    age: { type: 'number' }, // set the attribute type
    name: { type: 'string', map: 'data' }, // map 'name' to table attribute 'data'
    emailVerified: { type: 'boolean', required: true }, // specify attribute as required
    co: { alias: 'company' }, // alias table attribute 'co' to 'company'
    status: ['sk', 0], // composite key mapping
    date_added: ['sk', 1] // composite key mapping
  },

  // Assign it to our table
  table: MyTable

  // In Typescript, the "as const" statement is needed for type inference
} as const)
```

## Put an item

```typescript
// Create an item (using table attribute names or aliases)
const customer = {
  id: 123,
  age: 35,
  name: 'Jane Smith',
  emailVerified: true,
  company: 'ACME',
  status: 'active',
  date_added: '2020-04-24'
}

// Use the 'put' method of Customer:
await Customer.put(customer)
```

The item will be saved to DynamoDB like this:

```typescript
{
  "pk": 123,
  "sk": "active#2020-04-24",
  "age": 35,
  "data": "Jane Smith",
  "emailVerified": true,
  "co": "ACME",
  // Attributes auto-generated by DynamoDB-Toolbox
  "_et": "customer", // Entity name (required for parsing)
  "_ct": "2021-01-01T00:00:00.000Z", // Item creation date (optional)
  "_md": "2021-01-01T00:00:00.000Z" // Item last modification date (optional)
}
```

## Get an Item

```typescript
// Specify primary key
const primaryKey = {
  id: 123,
  status: 'active',
  date_added: '2020-04-24'
}

// Use the 'get' method of Customer
const response = await Customer.get(primaryKey)
```

## Entity Type Inference

Since v0.4, the method inputs, options and response types are inferred from the Entity definition:

```typescript
await Customer.put({
  id: 123,
  // ❌ Sort key is required ("sk" or both "status" and "date_added")
  age: 35,
  name: ['Jane', 'Smith'], // ❌ name should be a string
  emailVerified: undefined, // ❌ attribute is marked as required
  company: 'ACME'
})

const { Item: customer } = await Customer.get({
  id: 123,
  status: 'active',
  date_added: '2020-04-24' // ✅ Valid primary key
})
type Customer = typeof customer
// 🙌 Type is equal to:
type ExpectedCustomer =
  | {
      id: any
      age?: number | undefined
      name?: string | undefined
      emailVerified: boolean
      company?: any
      status: any
      date_added: any
      entity: string
      created: string
      modified: string
    }
  | undefined
```
