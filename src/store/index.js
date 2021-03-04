import Vue from 'vue'
import Vuex from 'vuex'
import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";

Vue.use(Vuex)

const state = {
    items: []
}

const store = new Vuex.Store({
    state,
    actions,
    getters,
    mutations
})

export default store;