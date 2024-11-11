export type tabType = {
  // Имя таба
  tab: string
  // Входящие секции. состоит только из tab, если нет дочерних section`ов
  sections: string[]
  // если ли дочерние section`ы
  onlyHead: boolean
}

export interface UserProfileType {
  id: number
  photo: Record<string, any>[]
  last_login_date: string
  properties: Record<string, any>
  user: number
}
