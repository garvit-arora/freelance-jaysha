import alternatives from './venue-alternatives.json'
import registry from './venue-coordinates.json'
import type { DateMemory } from './dates-memories'
export type VenueCoordinate = { name: string; latitude: number; longitude: number; source: string; verifiedAt: string; precision: string; provenance?: string }
export const venueCoordinates: Record<string, VenueCoordinate> = registry
export function venueFor(memory: DateMemory): VenueCoordinate | undefined {
  return venueCoordinates[memory.place.trim().toLowerCase()]
}

export const venueAlternatives: Record<string, VenueCoordinate[]> = alternatives
