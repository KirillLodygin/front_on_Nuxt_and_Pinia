export default {
  'Санкт-Петербург': [
    'Границы субъекта',
    'Населенные пункты',
    'Районы',
    'Муниципальные образования',
    'Кадастровые кварталы',
    'ГЕНПЛАН',
    'ПЗЗ',
    'Земельные участки',
    'Здания',
    'Сооружения',
    'ОНС',
  ],
  Москва: [
    'Границы субъекта',
    'Административные округа',
    'Районы',
    'Муницип. образования',
    'Кадастровые кварталы',
    'Зоны Москвы',
    'Центр Москвы',
    'Земельные участки',
    'Здания',
    'Сооружения',
    'ОНС',
  ],
}
export const fixNames: any = {
  'Кадастровые кварталы': ['Кадастр. кварталы', 'Кадастр.кварталы', 'Кадастр_кварталы'],
  'ГЕНПЛАН зоны': ['ГЕНПЛАН. зоны', 'ГЕНПЛАН.зоны', 'ГЕНПЛАН_зоны'],
  'Границы субъекта': ['Границы. субъекта', 'Границы.субъекта', 'Границы_субъекта'],
  'Муниципальные образования': ['Муницип. образования', 'Муницип.образования', 'Муницип_образования'],
  'Административные районы': ['Администр. районы', 'Администр.районы', 'Администр_районы'],
  'Административные округа': ['Администр. округа', 'Администр.округа', 'Администр_округа'],
  'Населенные пункты': ['Населенные_пункты'],
}

export const realtyObjectBuildingCategories = ['amenity', 'building', 'office', 'shop', 'place', 'leisure']

export const realtyObjectBuildingTypes: Record<string, any> = {
  place: ['house'],
  leisure: ['fitness_centre', 'sports_centre'],
}

export function isOsmBuilding(osmObj: Record<string, any>) {
  if (realtyObjectBuildingCategories.includes(osmObj.category) && !realtyObjectBuildingTypes[osmObj.category]) {
    return true
  }
  if (realtyObjectBuildingTypes[osmObj.category] && realtyObjectBuildingTypes[osmObj.category].includes(osmObj.type)) {
    return true
  }
  return false
}
