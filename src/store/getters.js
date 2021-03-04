function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function sortItems(a, b, sortBy, sortOrder) {
    if (!sortOrder) {
        [a, b] = [b, a];
    }

    // DateSent
    if (sortBy === 'DateSent') {
        if (b.DateSent !== a.DateSent) {
            return new Date(b.DateSent) - new Date(a.DateSent)
        } else {
            return parseInt(b.Preferred) - parseInt(a.Preferred)
        }
    }

    // Company
    if (sortBy === 'Company') {
        if (b.Company !== a.Company) {
            let stringA = a.Company.toLowerCase()
            let stringB = b.Company.toLowerCase()
            if (stringA < stringB)
                return -1
            if (stringA > stringB)
                return 1
            return 0
        } else {
            return parseInt(b.Preferred) - parseInt(a.Preferred)
        }
    }

    // Default
    if (b.DateSent !== a.DateSent) {
        return new Date(b.DateSent) - new Date(a.DateSent)
    } else {
        return parseInt(b.Preferred) - parseInt(a.Preferred)
    }
}

function getColumnPrices(state, currency, couponType, year, priceType, company) {
    let arr = ['Spread', 'Yield', '3MLSpread'];
    if (arr.indexOf(priceType) === -1) {
        return null;
    }

    let prices = [];
    state.items.forEach(item => {
        if (item.Quote) {
            item.Quote.forEach(element => {
                if (
                    element[priceType] &&
                    element.Currency === currency &&
                    element.CouponType === couponType &&
                    element.Years === year
                ) {
                    if (company) {
                        if (item.Company === company) {
                            prices.push(element[priceType]);
                        }
                    } else {
                        prices.push(element[priceType]);
                    }
                }
            })
        }
    });

    return prices;
}

function getRowPrices(state, currency, couponType, priceType, company) {
    let arr = ['Spread', 'Yield', '3MLSpread'];
    if (arr.indexOf(priceType) === -1) {
        return null;
    }

    let prices = [];
    state.items.forEach(item => {
        if (item.Quote) {
            item.Quote.forEach(element => {
                if (
                    element[priceType] &&
                    element.Currency === currency &&
                    element.CouponType === couponType &&
                    item.Company === company
                ) {
                    prices.push(element[priceType]);
                }
            })
        }
    });

    return prices;
}

const defaultCurrency = "USD";

export default {
    getAverageValues: (state) => (currency, couponType, year, priceType, company) => {
        let prices = getColumnPrices(state, currency, couponType, year, priceType, company)

        let average = prices.reduce((a, b) => a + b, 0) / (prices.length || 1);
        if (average <= 0) {
            return null
        }
        if (priceType === 'Spread') {
            return '+' + parseInt(average) + 'bp';
        }
        if (priceType === 'Yield') {
            return parseFloat(average).toFixed(3) + '%';
        }
        if (priceType === '3MLSpread') {
            return '+' + parseInt(average) + 'bp';
        }
    },

    isMinimalPrice: (state, getters) => (item, currency, couponType, years, priceType, company) => {
        let prices = getRowPrices(state, currency, couponType, priceType, company)
        let sortedPrices = prices.sort((a, b) => a - b)

        let quote = getters.filteredQuote(item, currency, couponType, years)
        if (!quote || !quote[0]) {
            return false;
        }

        return sortedPrices.indexOf(quote[0][priceType]) === 0;
    },

    getCurrencies: (state) => {
        let currencies = [];
        state.items.forEach(item => {
            if (item.Quote) {
                item.Quote.forEach(element => {
                    if (element.Currency) {
                        currencies.push(element.Currency);
                    }
                })
            }
        });
        let sortedCurrencies = currencies.filter(onlyUnique).sort()
        let position = sortedCurrencies.indexOf(defaultCurrency);
        if (position !== -1) {
            sortedCurrencies.splice(position, 1)
            sortedCurrencies.unshift(defaultCurrency)
        }
        return sortedCurrencies;
    },

    getYears: (state) => (currency) => {
        let years = [];
        state.items.forEach(item => {
            if (item.Quote) {
                item.Quote.forEach(element => {
                    if (element.Years) {
                        if (element.Currency === currency) {
                            years.push(element.Years);
                        }
                    }
                })
            }
        });
        return years.filter(onlyUnique).sort((a, b) => a - b)
    },

    filteredQuote: () => (item, currency, couponType, years) => {
        if (item.Quote !== null) {
            return item.Quote
                .filter(element => element.Currency === currency)
                .filter(element => element.CouponType === couponType)
                .filter(element => element.Years === years)
        }
        return null;
    },

    getPriceByType: (state, getters) => (item, currency, couponType, years, priceType) => {
        let quote = getters.filteredQuote(item, currency, couponType, years)
        if (!quote || !quote[0]) {
            return null;
        }

        if (priceType === 'Spread') {
            if (quote[0].Spread) {
                return '+' + parseInt(quote[0].Spread) + 'bp';
            }
        }
        if (priceType === 'Yield') {
            if (quote[0].Yield) {
                return parseFloat(quote[0].Yield).toFixed(3) + '%';
            }
        }
        if (priceType === '3MLSpread') {
            let quote = getters.filteredQuote(item, currency, couponType, years)
            if (quote[0]['3MLSpread']) {
                return '+' + parseInt(quote[0]['3MLSpread']) + 'bp';
            }
        }
        return null;
    },

    getItemsWithQuote: (state) => {
        return state.items.filter(element => element.Quote)
    },

    getItemsWithoutQuote: (state) => {
        return state.items.filter(element => !element.Quote)
    },

    getSortedItems: (state, getters) => (sortBy, sortOrder) => {
        return getters.getItemsWithQuote.sort((a, b) => {
            return sortItems(a, b, sortBy, sortOrder)
        })
    },

    getSortedItemsWithoutQuote: (state, getters) => (sortBy, sortOrder) => {
        return getters.getItemsWithoutQuote.sort((a, b) => {
            return sortItems(a, b, sortBy, sortOrder)
        })
    }
}