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

describe('Persian classification labels', () => {
  it('covers every sub-group and every machine', async () => {
    const { SUBGROUP_FA, MACHINE_FA } = await import('../../classifications')
    for (const s of subGroups) {
      expect(SUBGROUP_FA[s.name], `missing Persian for sub-group: ${s.name}`).toBeDefined()
    }
    for (const m of machines) {
      expect(MACHINE_FA[m.key], `missing Persian for machine: ${m.key}`).toBeDefined()
    }
  })

  it('carries an EAR reference code on every entry', async () => {
    const { SUBGROUP_FA, MACHINE_FA } = await import('../../classifications')
    for (const [name, t] of Object.entries(SUBGROUP_FA)) {
      expect(t.code, `no code for ${name}`).toMatch(/^\d{2}(\.\d+)*$/)
      expect(t.fa.length).toBeGreaterThan(3)
    }
    for (const [key, t] of Object.entries(MACHINE_FA)) {
      expect(t.code, `no code for ${key}`).toMatch(/^\d{2}(\.\d+)*$/)
    }
  })

  it('never lets a Persian label become a rate lookup key', async () => {
    // The engine must still resolve rates from the ENGLISH name only.
    const { subGroupLabel, machineLabel } = await import('../../classifications')
    const s = subGroups[0]
    expect(subGroupLabel(s.name)).not.toBe(s.name)
    expect(findSubGroup(s.name)).toBeDefined()
    expect(findSubGroup(subGroupLabel(s.name))).toBeUndefined()

    const m = machines[0]
    expect(findMachine(m.key)).toBeDefined()
    expect(findMachine(machineLabel(m.key))).toBeUndefined()
  })

  it('disambiguates the 14 identically-named machines by code', async () => {
    const { MACHINE_FA } = await import('../../classifications')
    const others = machines.filter((m) =>
      m.key.endsWith('Other individual machines, not specified elsewhere'),
    )
    const labels = others.map((m) => `${MACHINE_FA[m.key].code} ${MACHINE_FA[m.key].fa}`)
    expect(new Set(labels).size).toBe(others.length)
  })
})
