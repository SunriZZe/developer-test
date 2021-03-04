function addItem(state, element) {
    state.items.push(element)
}

export default {
    fillItems(state, data) {
        state.items = [];
        if (data.Items !== undefined && data.Items !== null) {
            data.Items.forEach((element, index) => {
                element.display = false
                element.index = index
                addItem(state, element)
            })
        }
    },
    toggleItem(state, index) {
        if (state.items[index].display === true) {
            state.items[index].display = false
            return
        }
        if (state.items[index].display === false) {
            state.items[index].display = true
        }
    },
}