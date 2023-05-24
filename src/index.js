/// <reference types="cypress" />
// @ts-check

const fs = require('fs')
const { updateText } = require('./update-text')
const ghCore = require('@actions/core')
const { getSpecEmoji, getStateEmoji } = require('./utils')

function registerCypressJsonResults(options = {}) {
  const defaults = {
    filename: 'results.json',
  }
  options = { ...defaults, ...options }
  if (!options.on) {
    throw new Error('Missing required option: on')
  }

  // keeps all test results by spec
  let allResults

  // `on` is used to hook into various events Cypress emits
  options.on('before:run', () => {
    allResults = {}
  })

  options.on('after:spec', (spec, results) => {
    allResults[spec.relative] = {}
    // shortcut
    const r = allResults[spec.relative]
    results.tests.forEach((t) => {
      const testTitle = t.title.join(' ')
      r[testTitle] = t.state
    })
  })

  options.on('after:run', (afterRun) => {
    // add the totals to the results
    // explanation of test statuses in the blog post
    // https://glebbahmutov.com/blog/cypress-test-statuses/
    allResults.totals = {
      suites: afterRun.totalSuites,
      tests: afterRun.totalTests,
      failed: afterRun.totalFailed,
      passed: afterRun.totalPassed,
      pending: afterRun.totalPending,
      skipped: afterRun.totalSkipped,
    }

    if (options.filename === false) {
      console.log(
        'cypress-json-results: skipped writing because filename=false',
      )
    } else {
      const str = JSON.stringify(allResults, null, 2)
      fs.writeFileSync(options.filename, str + '\n')
      console.log('cypress-json-results: wrote results to %s', options.filename)
    }

    if (options.updateMarkdownFile) {
      const markdownFile = options.updateMarkdownFile
      const markdown = fs.readFileSync(markdownFile, 'utf8')
      const updated = updateText(markdown, allResults.totals)
      fs.writeFileSync(markdownFile, updated)
      console.log(
        'cypress-json-results: updated Markdown file %s',
        markdownFile,
      )
    }

    // https://github.blog/2022-05-09-supercharging-github-actions-with-job-summaries/
    if (options.githubActionsSummary === 'spec') {
      delete allResults.totals
      const specs = Object.keys(allResults)
      const specRows = specs.map((specName) => {
        const specState = allResults[specName]
        const emoji = getSpecEmoji(specState)
        return [specName, emoji]
      })

      const specsWord = specs.length === 1 ? 'spec' : 'specs'
      ghCore.summary
        .addHeading(`${specs.length} ${specsWord}`)
        .addTable([
          [
            { data: 'Spec', header: true },
            { data: 'State', header: true },
          ],
          ...specRows,
        ])
        .addLink(
          'bahmutov/cypress-json-results',
          'https://github.com/bahmutov/cypress-json-results',
        )
        .write()
    } else if (options.githubActionsSummary === 'test') {
      delete allResults.totals
      const specs = Object.keys(allResults)
      const specRows = []
      specs.forEach((specName) => {
        const tests = allResults[specName]
        const testNames = Object.keys(tests)
        const testN = testNames.length
        specRows.push([
          { data: specName, header: true },
          { data: String(testN), header: true },
        ])
        testNames.forEach((testTitle) => {
          const testState = tests[testTitle]
          const emoji = getStateEmoji(testState)
          specRows.push([testTitle, emoji])
        })
      })

      ghCore.summary
        .addHeading('Individual test results')
        .addTable([...specRows])
        .addLink(
          'bahmutov/cypress-json-results',
          'https://github.com/bahmutov/cypress-json-results',
        )
        .write()
    }
  })
}

module.exports = registerCypressJsonResults
