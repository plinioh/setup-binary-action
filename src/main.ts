import * as core from '@actions/core'
import { Binary } from './binary'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const binary = new Binary(
      core.getInput('binaryName'),
      core.getInput('binaryUrl'),
      core.getInput('binaryPathInArchive')
    )
    await binary.setup()
  } catch (error) {
    // Fail the workflow run if an error occurs
    console.log(error)
    if (error instanceof Error) core.setFailed(error.message)
  }
}
