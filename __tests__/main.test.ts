/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import * as binary from '../src/binary'

const binaryUrl =
  'https://github.com/aws-cloudformation/cloudformation-guard/releases/download/3.0.1/cfn-guard-v3-ubuntu-latest.tar.gz'
const binaryPathInArchive = 'cfn-guard-v3-ubuntu-latest/cfn-guard'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let getInputMock: jest.SpyInstance
let setFailedMock: jest.SpyInstance

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
  })

  it('should setup cfn-guard binary', async () => {
    const binarySetupMock = jest
      .spyOn(binary.Binary.prototype, 'setup')
      .mockImplementation()

    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'binaryName':
          return 'cfn-guard'
        case 'binaryUrl':
          return binaryUrl
        case 'binaryPathInArchive':
          return binaryPathInArchive
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()
    expect(binarySetupMock).toHaveBeenCalled()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).not.toHaveBeenCalled()
  })

  it('should fail to setup cfn-guard binary', async () => {
    const binarySetupMock = jest
      .spyOn(binary.Binary.prototype, 'setup')
      .mockImplementation(() => {
        throw new Error('Action input "binaryPathInArchive is required')
      })
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'binaryName':
          return 'cfn-guard'
        case 'binaryUrl':
          return binaryUrl
        case 'binaryPathInArchive':
          return ''
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()
    expect(binarySetupMock).toHaveBeenCalled()
    expect(setFailedMock).toHaveBeenCalled()
  })
})
