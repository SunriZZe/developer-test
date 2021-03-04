import * as api from '@/api'

export default {
    getItems({commit}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                api.getData(data => {
                    commit('fillItems', data)
                }).then(() => {
                    resolve()
                })
            }, 1)
        })
    },
}