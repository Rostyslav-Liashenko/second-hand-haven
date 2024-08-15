## Description

### Our stack

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.
Website - [https://nestjs.com](https://nestjs.com/).

[TypeOrm](https://typeorm.io/) - our ORM.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
## Migrations

```bash
# Create new migration:
npm run migration:create ./src/migrations/new-migration-name

# Generate migration:
npm run migration:generate ./src/migrations/migration-name

# Run migrations:
npm run migration:run

# Revert latest migration
npm run migration:revert
```

## Commits

We follow such commit conventions:

```none
type: subject
body
```

Where `type` is some value from this list - `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `revert`.

`subject` is short message of what you did. It cannot be longer than 100 chars.

`body` is a number of you card in trello. If your commit affects more than one ticket, you should write them all through a comma.

To enforce this we used git-hooks. On every commit runs `npm run lint` and `npx commitlint` and if there is any error you won't be able to commit until all errors are fixed.

Example of commit:

```none
feat: add custom logger
tickets: 8
```

Example of commit which affects a few cards on trello board:

```none
docs: add documentation for something
tickets: 33, 44
```

## Pull requests

We follow such pull request conventions:

```none
Template: Type/task_index description
Ex.: Fix/68 remove vacation requests view
```

## Branches

We have similar branch naming conventions to commits:

```none
type/card-number_subject
```

`Type` is a value in the same list as [`type`](#commits) from commit

`Card number` is a number of a trello card.

`Subject` is a short summary of card or what would be done in this branch.

Example:

```none
feat/5_add-precommit-hooks
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).
