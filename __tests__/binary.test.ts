/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as b from '../src/binary'
import * as misc from '../src/misc'
import os from 'os'
import * as path from 'path'
import * as io from '@actions/io'

const binaryName = 'cfn-guard'
const binaryUrl =
  'https://github.com/aws-cloudformation/cloudformation-guard/releases/download/3.0.1/cfn-guard-v3-ubuntu-latest.tar.gz'
const binaryPathInArchive = 'cfn-guard-v3-ubuntu-latest/cfn-guard'

// Mock the GitHub Actions core library
let addPathMock: jest.SpyInstance

describe('binary validate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should test binary validate function happy path', async () => {
    expect(() =>
      new b.Binary(binaryName, binaryUrl, binaryPathInArchive).validate()
    ).not.toThrow()
  })

  it('should test binary validate function without binary name', async () => {
    expect(() => {
      new b.Binary('', binaryUrl, binaryPathInArchive).validate()
    }).toThrow(Error('Action input "binaryName" is required.'))
  })

  it('should test binary validate function without binaryUrl', async () => {
    expect(() => {
      new b.Binary(binaryName, '', binaryPathInArchive).validate()
    }).toThrow(Error('Action input "binaryUrl" is required.'))
  })

  it('should test binary validate function with an invalid binary url', async () => {
    expect(() => {
      new b.Binary(binaryName, 'notAnUrl', binaryPathInArchive).validate()
    }).toThrow(Error('Action input "binaryUrl" is not a valid URL.'))
  })

  it('should test binary validate function with an invalid file name on binary url', async () => {
    expect(() => {
      new b.Binary(
        binaryName,
        'https://example.com',
        binaryPathInArchive
      ).validate()
    }).toThrow(Error('Action input "binaryUrl" must point to a ".tar.gz" file'))
  })

  it('should test binary validate function without binaryPathInArchive', async () => {
    expect(() => {
      new b.Binary(binaryName, binaryUrl, '').validate()
    }).toThrow(Error('Action input "binaryPathInArchive" is required.'))
  })
})

const tempDir = path.join(os.tmpdir(), 'runner', 'temp')
const toolDir = path.join(os.tmpdir(), 'runner', 'tool')
const env = process.env

describe('binary setup', () => {
  beforeAll(() => {
    process.env = { ...env, RUNNER_TOOL_CACHE: toolDir, RUNNER_TEMP: tempDir }
  })
  beforeEach(() => {
    jest.clearAllMocks()
    addPathMock = jest.spyOn(core, 'addPath').mockImplementation()
  })

  it('should test binary setup function happy path', async () => {
    const binary = new b.Binary(binaryName, binaryUrl, binaryPathInArchive)
    // Improvement: Mock the filesystem so we don't need to download the binary each time
    const getBinMock = jest
      .spyOn(misc, 'getBinaryDestinationPath')
      .mockReturnValue(tempDir)

    await binary.setup()

    expect(getBinMock).toHaveBeenCalled()
    expect(addPathMock).toHaveBeenCalled()
  })
  afterAll(() => {
    io.rmRF(tempDir)
    process.env = env
    jest.unmock('../src/binary')
  })
})
