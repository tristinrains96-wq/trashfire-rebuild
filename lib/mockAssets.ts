export interface Character {
  id: string
  name: string
  thumb: string
}

export interface Background {
  id: string
  name: string
  thumb: string
}

export const userCharacters: Character[] = [
  { id: 'char_rin_v3', name: 'Rin (canon v3)', thumb: '/placeholder.svg' },
  { id: 'char_daichi_v2', name: 'Daichi (v2)', thumb: '/placeholder.svg' },
  { id: 'char_principal_v1', name: 'Vice Principal', thumb: '/placeholder.svg' },
  { id: 'char_teacher_v1', name: 'Teacher', thumb: '/placeholder.svg' },
]

export const userBackgrounds: Background[] = [
  { id: 'bg_rooftop_night_v2', name: 'Rooftop Night v2', thumb: '/placeholder.svg' },
  { id: 'bg_school_hallway_v1', name: 'School Hallway', thumb: '/placeholder.svg' },
  { id: 'bg_shopping_district_v3', name: 'Shopping District', thumb: '/placeholder.svg' },
  { id: 'bg_classroom_v1', name: 'Classroom', thumb: '/placeholder.svg' },
  { id: 'bg_city_street_v2', name: 'City Street', thumb: '/placeholder.svg' },
]
