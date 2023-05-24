/// <reference types="cypress" />

import { getCountTable, updateText } from '../../src/update-text'
import { stripIndent } from 'common-tags'

describe('Markdown utils', () => {
  it('forms table', () => {
    const totals = {
      passed: 10,
      failed: 2,
      pending: 1,
      skipped: 3,
      tests: 15,
    }
    const text = getCountTable(totals)
    expect(text).to.equal(stripIndent`
      Test status | Count
      ---|---
      Passed | 10
      Failed | 2
      Pending | 1
      Skipped | 3
      **Total** | 15
    `)
  })

  it('updates table in the text', () => {
    const text = stripIndent`
      This is some Markdown text
      and then there is a comment with the table

      <!-- cypress-test-counts -->
      Test status | Count
      ---|---
      Passed | 1
      Failed | 0
      Pending | 1
      Skipped | 0
      **Total** | 2
      <!-- cypress-test-counts-end -->

      the end
    `

    const totals = {
      passed: 10,
      failed: 2,
      pending: 1,
      skipped: 3,
      tests: 15,
    }

    const updated = updateText(text, totals)
    expect(updated).to.equal(stripIndent`
      This is some Markdown text
      and then there is a comment with the table

      <!-- cypress-test-counts -->
      Test status | Count
      ---|---
      Passed | 10
      Failed | 2
      Pending | 1
      Skipped | 3
      **Total** | 15
      <!-- cypress-test-counts-end -->

      the end
    `)
  })
})

describe('Misc utils', () => {
  // this is NOT how merging options with defaults should work
  // and this test is only to confirm the incorrect behavior
  // https://github.com/bahmutov/cypress-json-results/issues/9
  it('merges options with defaults incorrectly', () => {
    let options = {
      on: 'on',
    }
    const defaults = {
      filename: 'results.json',
    }
    options = { ...options, defaults }
    expect(options).to.deep.equal({
      on: 'on',
      defaults,
    })
  })

  it('merges options with defaults', () => {
    let options = {
      on: 'on',
    }
    const defaults = {
      filename: 'results.json',
    }
    options = { ...defaults, ...options }
    expect(options).to.deep.equal({
      on: 'on',
      filename: 'results.json',
    })
  })

  it('sets filename', () => {
    let options = {
      on: 'on',
      filename: 'output.json',
    }
    const defaults = {
      filename: 'results.json',
    }
    options = { ...defaults, ...options }
    expect(options).to.deep.equal({
      on: 'on',
      filename: 'output.json',
    })
  })
})
