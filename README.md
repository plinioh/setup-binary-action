# Setup Binary Action

Download and Setup a custom binary for usage within a workflow. Currently only works with `.tar.gz` archives.

[![GitHub Super-Linter](https://github.com/plinioh/setup-binary-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/plinioh/setup-binary-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/plinioh/setup-binary-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/plinioh/save-binary-action/actions/workflows/check-dist.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

## Inputs

| name                | required | type   | default | description                                                                  |
| ------------------- | -------- | ------ | ------- | ---------------------------------------------------------------------------- |
| binaryName          | yes      | string |         | The name you want your binary to be acessible by                             |
| binaryUrl           | yes      | string |         | The URL pointing to the ".tar.gz" archive that contains the binary           |
| binaryPathInArchive | yes      | string |         | The path within the ".tar.gz" archive to your binary. e.g: path/to/my-binary |

## Example usage

Workflow:

```yml
name: Setup Binary Example
on:
  pull_request:
    branches: [main]
jobs:
  setup-binary:
    name: Setup Binary Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        id: checkout
        uses: actions/checkout@v4

      - name: Setup cfn-guard binary
        id: setup-cfn-guard
        uses: plinioh/setup-binary-action@v1.0.0
        with:
          binaryName: cfn-guard
          binaryUrl: https://github.com/aws-cloudformation/cloudformation-guard/releases/download/3.0.1/cfn-guard-v3-ubuntu-latest.tar.gz
          binaryPathInArchive: cfn-guard-v3-ubuntu-latest/cfn-guard

      - name: Test Binary
        id: test-binary
        run: cfn-guard --version
```

## Dev instructions

### Requirements

- Node.js >= 20
- [act](https://github.com/nektos/act) if you want to test your action locally.

To get started:

- Run `npm install`
- Run `npm run bundle` to build the action into dist/
- `act -j test-action pull_request` --> This will build a docker container and
  run your action in it.
