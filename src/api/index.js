import {data} from './mock-data';

const LATENCY = 16

export function getData(cb) {
    return new Promise((resolve) => {
        setTimeout(() => {
                cb(data)
                resolve()
            },
            LATENCY
        )
    })
}