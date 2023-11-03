import * as path from 'path'
import os from 'os'
import * as core from '@actions/core'
import * as io from '@actions/io'
import * as tc from '@actions/tool-cache'
import * as fs from 'fs-extra'
import * as exec from '@actions/exec'
import { getBinaryDestinationPath } from '../src/misc'

export class Binary {
  binaryName: string
  binaryUrl: string
  binaryPathInArchive: string

  constructor(
    binaryName: string,
    binaryUrl: string,
    binaryPathInArchive: string
  ) {
    this.binaryName = binaryName
    this.binaryUrl = binaryUrl
    this.binaryPathInArchive = binaryPathInArchive
  }

  validate(): void {
    if (!this.binaryName) {
      throw new Error(`Action input "binaryName" is required.`)
    }
    if (!this.binaryUrl) {
      throw new Error(`Action input "binaryUrl" is required.`)
    }
    if (!matchesUrlRegex(this.binaryUrl)) {
      throw new Error(`Action input "binaryUrl" is not a valid URL.`)
    }
    if (!isTarGz(this.binaryUrl)) {
      throw new Error(`Action input "binaryUrl" must point to a ".tar.gz" file`)
    }
    if (!this.binaryPathInArchive) {
      throw new Error('Action input "binaryPathInArchive" is required.')
    }
  }

  async setup(): Promise<void> {
    this.validate()
    const pseudoRandomString = (Math.random() + 1).toString(36).substring(12)
    const tempDir = path.join(os.tmpdir(), 'runner', pseudoRandomString)
    await io.mkdirP(tempDir)
    const downloadPath = await tc.downloadTool(this.binaryUrl)
    const extractedPath = await tc.extractTar(downloadPath, tempDir)
    const destinationBinaryPath = getBinaryDestinationPath()

    const extractedBinaryFullPath = path.join(
      extractedPath,
      this.binaryPathInArchive
    )
    const destinationBinaryFullPath = path.join(
      destinationBinaryPath,
      this.binaryName
    )

    if (!fs.existsSync(destinationBinaryFullPath)) {
      core.info(
        `Moving from ${extractedBinaryFullPath} to ${extractedBinaryFullPath}`
      )
      fs.moveSync(extractedBinaryFullPath, destinationBinaryFullPath)
    }

    if (process.platform !== 'win32') {
      await exec.exec('chmod', ['+x', destinationBinaryFullPath])
    }
    core.addPath(destinationBinaryPath)
    return io.rmRF(tempDir)
  }
}
function isTarGz(binaryUrl: string): boolean {
  /* istanbul ignore next */
  const fileName = binaryUrl.split(/[#?]/)[0].split('/').pop() ?? ''
  if (!fileName.endsWith('.tar.gz')) {
    return false
  }
  return true
}

function matchesUrlRegex(input: string): boolean {
  const reg = /https?:\/\/[^\s/$.?#].[^\s]*/g
  return reg.test(input)
}
