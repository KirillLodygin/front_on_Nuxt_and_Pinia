export enum mapModeType {
    free,
    measuring,
}

export enum measureModeType {
    distance,
    area,
}

export type measurePointType = {
    id: string,
    length: number,
    coordinates: [number, number]
}