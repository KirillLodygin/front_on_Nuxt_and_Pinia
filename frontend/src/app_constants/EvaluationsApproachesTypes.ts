export interface EATypesInterface {
  ST: string[]
  EX: string[]
  AI: string[]
  CA: string[]
}

export interface EStatusesInterface {
  P: string
  C: string
  E: string
}

export const EvaluationsApproachesTypes: EATypesInterface = {
  ST: ['СП', 'Сравнительный подход'],
  EX: ['ЭО', 'Экспресс-оценка'],
  AI: ['ДП', 'Доходный подход'],
  CA: ['ЗП', 'Затратный подход'],
}

export const EvaluationsStatuses: EStatusesInterface = {
  P: 'В работе',
  C: 'Выполнен',
  E: 'Итоговый',
}
