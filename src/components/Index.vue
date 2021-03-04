<template>
  <div class="index">
    <div class="row">
      <div class="col-auto">
        <b-button-group>
          <b-button
              v-for="currency in getCurrencies"
              :key="currency"
              @click="setCurrency(currency)"
              :variant="currencyVariant(currency)"
          >
            {{ currency }}
          </b-button>
        </b-button-group>
      </div>
      <div class="col-auto">
        <b-button-group>
          <b-button
              v-for="yearElement in getYears(currency)"
              :key="yearElement"
              @click="setYears(yearElement)"
              :variant="yearVariant(yearElement)"
          >
            {{ yearElement }} YRS
          </b-button>
        </b-button-group>
      </div>
      <div class="col-auto">
        <b-button-group>
          <b-button
              v-for="type in constants.priceTypes"
              :key="type"
              @click="setPriceType(type)"
              :variant="priceTypeVariant(type)"
          >
            {{ type }}
          </b-button>
        </b-button-group>
      </div>
    </div>

    <br/>

    <div class="row">
      <div class="col-auto">
        <b-form-input v-model="companySearch" placeholder="Filter by company name"/>
        {{ companySearch }}
      </div>
    </div>

    <br/>

    <table class="table">
      <tr>
        <th></th>
        <th></th>
        <th></th>
        <th v-for="year in selectedYears" :key="year" colspan="2">
          {{ year }} YRS
        </th>
      </tr>

      <tr>
        <th></th>
        <th class="cursor-pointer" @click="setSort('DateSent')">
          DATE SENT
          <template v-if="sortBy === 'DateSent'">
            <b-icon-caret-down-fill v-if="sortOrder"/>
            <b-icon-caret-up-fill v-else/>
          </template>
          <b-icon-caret-down-fill
              v-else
              class="disabled"
          />
        </th>
        <th class="cursor-pointer" @click="setSort('Company')">
          COMPANY
          <template v-if="sortBy === 'Company'">
            <b-icon-caret-down-fill v-if="sortOrder"/>
            <b-icon-caret-up-fill v-else/>
          </template>
          <b-icon-caret-down-fill
              v-else
              class="disabled"
          />
        </th>
        <template v-for="year in selectedYears">
          <th :key="'fix_' + year">FIX</th>
          <th :key="'frn_' + year">FRN</th>
        </template>
      </tr>

      <template v-for="(item, index) in getSortedItems(sortBy, sortOrder)">
        <tr
            :key="'main_' + index"
            v-show="rowFilter(companySearch, item)"
        >
          <td class="cursor-pointer">
            <b-icon-chevron-down v-if="item.display" @click="toggleItem(item.index)"/>
            <b-icon-chevron-right v-else @click="toggleItem(item.index)"/>
          </td>
          <td>
            <b>{{ formattedDate(item.DateSent) }}</b>
          </td>
          <td>
            <b>{{ item.Company }}</b>
          </td>
          <template v-for="year in selectedYears">
            <td
                v-if="isMinimalPrice(item, currency, 'FIX', year, priceType, item.Company)"
                :key="'FIX_' + year"
                class="highlighted"
            >
              {{ getPriceByType(item, currency, "FIX", year, priceType) }}
            </td>
            <td
                v-else
                :key="'FIX_' + year"
            >
              {{ getPriceByType(item, currency, "FIX", year, priceType) }}
            </td>
            <td :key="'FRN_' + year">{{ getPriceByType(item, currency, "FRN", year, priceType) }}</td>
          </template>
        </tr>

        <tr
            :key="'secondary_' + index"
            v-if="item.display"
            v-show="rowFilter(companySearch, item)"
        >
          <td>
          </td>
          <td>{{ item.DateSent }}</td>
          <td>{{ remainingPriceTypes[0] }}</td>
          <template v-for="year in selectedYears">
            <td :key="'FIX_' + year">{{ getPriceByType(item, currency, "FIX", year, remainingPriceTypes[0]) }}</td>
            <td :key="'FRN_' + year">{{ getPriceByType(item, currency, "FRN", year, remainingPriceTypes[0]) }}</td>
          </template>
        </tr>

        <tr
            :key="'third_' + index"
            v-if="item.display "
            v-show="rowFilter(companySearch, item)"
        >
          <td>
          </td>
          <td>{{ item.DateSent }}</td>
          <td>{{ remainingPriceTypes[1] }}</td>
          <template v-for="year in selectedYears">
            <td :key="'FIX_' + year">{{ getPriceByType(item, currency, "FIX", year, remainingPriceTypes[1]) }}</td>
            <td :key="'FRN_' + year">{{ getPriceByType(item, currency, "FRN", year, remainingPriceTypes[1]) }}</td>
          </template>
        </tr>
      </template>

      <template v-for="(item, index) in getSortedItemsWithoutQuote(sortBy, sortOrder)">
        <tr
            :key="index"
            v-show="rowFilter(companySearch, item)"
        >
          <td class="cursor-pointer">
          </td>
          <td>
            <span class="disabled">{{ item.DateSent }}</span>
          </td>
          <td>
            <span class="disabled">{{ item.Company }}</span>
          </td>
          <template v-for="year in selectedYears">
            <td :key="'FIX_' + year">{{
                getPriceByType(item, currency, "FIX", year, priceType)
              }}
            </td>
            <td :key="'FRN_' + year">{{ getPriceByType(item, currency, "FRN", year, priceType) }}</td>
          </template>
        </tr>
      </template>
      <tr>
        <td></td>
        <td></td>
        <td>Average by {{ priceType }}</td>
        <template v-for="year in selectedYears">
          <td :key="'FIX_' + year">{{ getAverageValues(currency, "FIX", year, priceType, companySearch) }}</td>
          <td :key="'FRN_' + year">{{ getAverageValues(currency, "FRN", year, priceType, companySearch) }}</td>
        </template>
      </tr>
    </table>
  </div>
</template>

<script>
import Vue from 'vue'
import {mapActions, mapGetters, mapMutations, mapState} from 'vuex';
import {BButtonGroup, BFormInput, BootstrapVueIcons} from 'bootstrap-vue'

Vue.use(BootstrapVueIcons)

const priceTypes = [
  "Spread",
  "Yield",
  "3MLSpread",
]

export default {
  name: 'Index',
  props: {
    msg: String
  },
  components: {
    BButtonGroup,
    BFormInput,
  },
  data: function () {
    return {
      constants: {
        priceTypes,
      },
      companySearch: '',
      currency: "USD",
      priceType: "Spread",
      selectedYears: [],
      sortBy: null,
      sortOrder: true,
    }
  },
  computed: {
    remainingPriceTypes: function () {
      return this.$data.constants.priceTypes.filter(element => element !== this.$data.priceType);
    },
    ...mapState({
      items: state => state.items,
    }),
    ...mapGetters([
      'isMinimalPrice',
      'filteredQuote',
      'getAverageValues',
      'getCurrencies',
      'getPriceByType',
      'getYears',
      'getSortedItems',
      'getSortedItemsWithoutQuote',
    ]),
  },
  methods: {
    ...mapActions([
      'getItems'
    ]),
    ...mapMutations([
      'toggleItem',
    ]),

    currencyVariant: function (currency) {
      if (currency === this.$data.currency) {
        return 'primary';
      }
      return 'outline-primary';
    },

    formattedDate(date) {
      return (new Date(date)).toLocaleDateString()
    },

    yearVariant: function (year) {
      if (this.$data.selectedYears.indexOf(year) === -1) {
        return 'outline-primary';
      }
      return 'primary';
    },

    priceTypeVariant: function (type) {
      if (type === this.$data.priceType) {
        return 'primary';
      }
      return 'outline-primary';
    },

    setCurrency: function (currency) {
      this.$data.currency = currency
      this.$data.selectedYears = this.$store.getters.getYears(currency)
    },

    setPriceType: function (type) {
      this.$data.priceType = type
    },

    setYears: function (year) {
      let position = this.$data.selectedYears.indexOf(year);
      if (position === -1) {
        this.$data.selectedYears.push(year)
      } else {
        this.$data.selectedYears.splice(position, 1)
      }
      this.$data.selectedYears.sort((a, b) => a - b)
    },

    setSort: function (rowName) {
      this.$data.sortBy = rowName
      this.$data.sortOrder = !this.$data.sortOrder
    },

    rowFilter: function (companySearch, item) {
      if (companySearch) {
        return companySearch === item.Company
      }
      return true;
    }
  },
  mounted() {
    this.$store.dispatch('getItems')
        .then(() => {
          this.$data.selectedYears = this.$store.getters.getYears(this.$data.currency)
        });
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.disabled {
  color: #8c8b8b;
  font-weight: bold;
}

.highlighted {
  background-color: antiquewhite;
}
</style>
