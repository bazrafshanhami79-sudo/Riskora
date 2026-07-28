/**
 * Guards on the shape of the extracted rate tables. These protect the defects
 * that were already found and fixed once — a regression here would silently
 * change quoted premiums rather than throw.
 */

import { describe, expect, it } from 'vitest'
import {
  cities,
  citiesFor,
  findCity,
  findMachine,
  findSubGroup,
  industryGroups,
  machines,
  provinces,
  subGroups,
  subGroupsFor,
} from '../data'

describe('rate table integrity', () => {
  it('carries the expected row counts', () => {
    expect(industryGroups).toHaveLength(19)
    expect(subGroups).toHaveLength(151)
    expect(machines).toHaveLength(108)
    expect(cities).toHaveLength(489)
  })

  it('keys every machine uniquely', () => {
    expect(new Set(machines.map((m) => m.key)).size).toBe(machines.length)
  })

  it('still has the duplicate machine descriptions that make key matching necessary', () => {
    const description = 'Other individual machines, not specified elsewhere'
    const matching = machines.filter((m) => m.key.endsWith(description))
    expect(matching.length).toBeGreaterThan(1)
    // …and those duplicates genuinely differ in rate.
    expect(new Set(matching.map((m) => m.basic)).size).toBeGreaterThan(1)
  })

  it('resolves every sub-group referenced by an industry group', () => {
    for (const group of industryGroups) {
      expect(subGroupsFor(group.label).length).toBe(group.subGroups.length)
    }
  })

  it('normalizes the transposed province/city fields in cities_2800.json', () => {
    // The raw file labels the city field `province` and vice versa.
    const qom = findCity('قم', 'قم')
    expect(qom).toBeDefined()
    expect(qom!.hazard).toBe('زیاد')
    expect(qom!.key).toBe('قم — قم')

    const tabriz = findCity('آذربایجان شرقی', 'تبریز')
    expect(tabriz).toBeDefined()
    expect(tabriz!.hazard).toBe('خیلی زیاد')
  })

  it('groups every city under a province', () => {
    expect(provinces.length).toBeGreaterThan(0)
    const total = provinces.reduce((sum, p) => sum + citiesFor(p).length, 0)
    expect(total).toBe(cities.length)
  })

  it('finds the reference-scenario sub-group and machine', () => {
    expect(findSubGroup('12.5 Paint factories and processing of comparable products')).toBeDefined()
    expect(findMachine('02.0.1 — Boiler feed pumps, incl. drive — turbine driven')).toBeDefined()
  })
})
