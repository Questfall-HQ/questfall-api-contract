#!/usr/bin/env bun

import process from 'node:process'
import { checkApplication, checkBackend, loadContract, loadSchemas, validateContract } from '../src/check.mjs'

function value(flag) {
  const index = process.argv.indexOf(flag)
  return index >= 0 ? process.argv[index + 1] : null
}

function report(label, result) {
  if (result.failures.length) {
    console.error(`${label} contract check failed:`)
    result.failures.forEach(failure => console.error(`- ${failure}`))
    process.exitCode = 1
    return
  }
  console.log(`${label} contract check passed (${result.count} routes)`)
}

const contract = loadContract()
const schemas = loadSchemas()
const application = value('--application')
const backend = value('--backend')

if (process.argv.includes('--contract')) {
  const failures = validateContract(contract, schemas)
  report('Contract', { failures, count: contract.routes.length })
} else if (application) {
  const result = checkApplication(application, contract, schemas)
  report('Application', { failures: result.failures, count: result.frontend.routes.length })
} else if (backend) {
  const result = checkBackend(backend, contract, schemas)
  report('Backend', { failures: result.failures, count: contract.routes.length })
} else {
  console.error('Usage: questfall-contract-check --contract | --application <dir> | --backend <dir>')
  process.exitCode = 1
}
