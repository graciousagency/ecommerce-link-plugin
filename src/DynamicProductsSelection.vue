<template>
  <div class="integration-selection">
    <div
      class="uk-flex uk-flex-middle util__grow integration-selection__header"
    >
      <div class="util__grow">
        <form class="uk-margin-right" @submit.prevent="search">
          <input
            @input="debouncedSearch"
            v-model="searchTerm"
            placeholder="Search"
            class="uk-width-1-1"
          />
        </form>
      </div>
      <div class="">
        <form class="uk-margin-right" @submit.prevent="search">
          <label class="uk-margin-right">Find by </label>
          <select
            name="findBy"
            @change="search()"
            class="form-control"
            v-model="findBy"
          >
            <option value="author">Author</option>
            <option value="brand">Brand</option>
            <option value="category">Category</option>
            <option value="series">Series</option>
          </select>
        </form>
      </div>
      <div class="uk-position-relative uk-text-nowrap">
        <div slot="actions">
          <a class="uk-button" @click.prevent="close">
            <i class="uk-icon-close"></i> Close
          </a>
        </div>
      </div>
    </div>

    <div class="error uk-margin-bottom" v-if="showLimitError">
      Limit reached. Please remove some products.
    </div>
    <div class="spinner" v-if="loading"></div>
    <div class="uk-grid integration-results" v-if="!loading">
      <div
        class="uk-width-large-1-3 uk-width-medium-1-2 uk-margin-bottom"
        v-for="result in response.items"
        :key="result.id"
      >
        <a
          href="#"
          class="integration-result"
          @click.prevent="addSelectedOption(result)"
        >
          <IntegrationItem
            :item="result"
            :current="currentProduct"
            :currentItems="currentProducts"
          />
        </a>
      </div>
      <div v-if="response.items.length === 0">
        <p class="uk">No results found</p>
      </div>
    </div>
    <IntegrationPagination
      :page="page"
      :totalPages="totalPages"
      :loadPage="loadPage"
      :loading="loading"
    />
  </div>
</template>

<script>
import axios from "axios";
import debounce from "debounce";
import IntegrationItem from "./IntegrationItem";
import IntegrationPagination from "./IntegrationPagination";
import { getCategories, getProducts } from "./queries";

const rootCategoryUid = "MjQxMzQ=";
const officeCategoryUid = "MzE5NTU=";
const booksCategoryUid = "MjQxMzU=";

export default {
  props: {
    config: Object,
    currentProduct: Object,
    currentProducts: Array,
    selectProduct: Function,
    selectProducts: Function,
    deleteItem: Function,
    close: Function,
  },
  data() {
    return {
      searchTerm: "",
      findBy: "author",
      perPage: 21,
      page: 1,
      allOptions: [],
      response: {
        total_count: 0,
        items: [],
      },
      showLimitError: false,
      loading: true,
    };
  },
  computed: {
    totalPages() {
      return this.response.total_count != 0
        ? Math.ceil(this.response.total_count / this.perPage)
        : 1;
    },
  },
  created() {
    this.getOptions();
  },
  methods: {
    debouncedSearch: debounce(function () {
      // If the user is searching for a category, do a search like normal
      if (this.findBy === "category") {
        this.search();
      }

      // If the user is searching for a brand, author or series, filter the options locally from the options that were fetched
      if (this.findBy !== "category") {
        this.response.items = this.allOptions.filter((option) =>
          option.label.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      }
    }, 300),
    search() {
      this.page = 1;
      this.getOptions();
    },
    getFilters() {
      // Forms the filters to query the options with

      if (this.findBy == "category") {
        if (!this.searchTerm)
          return {
            parent_category_uid: {
              eq: rootCategoryUid,
            },
          };

        return {
          name: {
            match: this.searchTerm,
          },
        };
      } else if (this.findBy == "brand") {
        return {
          category_uid: {
            eq: officeCategoryUid,
          },
        };
      } else if (this.findBy == "author") {
        return {
          category_uid: {
            eq: booksCategoryUid,
          },
        };
      } else if (this.findBy == "series") {
        return {
          category_uid: {
            eq: booksCategoryUid,
          },
        };
      }
    },
    getOptions() {
      // Does a query to get the type of options
      this.loading = true;

      if (this.findBy === "category") {
        // Do a category query
        axios
          .post(this.config.magentoUrl, {
            variables: {
              filters: this.getFilters(),
              pageSize: this.perPage,
              currentPage: this.page,
            },
            query: getCategories,
          })
          .then((result) => {
            this.response = result.data.data.categories;
            this.loading = false;
          });
      }

      if (this.findBy === "brand") {
        // Do a product query and get the brands
        // only products in the office category have a brand

        axios
          .post(this.config.magentoUrl, {
            variables: {
              filters: this.getFilters(),
              pageSize: 1,
              currentPage: 1,
            },
            query: getProducts,
          })
          .then((result) => {
            const brandOptions = result.data.data.products.aggregations
              .find((agg) => agg.attribute_code === "office_brand")
              .options.sort((a, b) => {
                return a.label.localeCompare(b.label);
              });

            this.allOptions = brandOptions;
            this.response.items = brandOptions;
            this.loading = false;
          });
      }

      if (this.findBy === "author") {
        // Do a product query and get the authors
        // only products in the books category have an author

        axios
          .post(this.config.magentoUrl, {
            variables: {
              filters: this.getFilters(),
              pageSize: 1,
              currentPage: 1,
            },
            query: getProducts,
          })
          .then((result) => {
            const authorOptions = result.data.data.products.aggregations
              .find((agg) => agg.attribute_code === "book_author")
              .options.sort((a, b) => {
                return a.label.localeCompare(b.label);
              });

            this.allOptions = authorOptions;
            this.response.items = authorOptions;
            this.loading = false;
          });
      }

      if (this.findBy === "series") {
        // Do a product query and get the series
        // only products in the books category have a series

        axios
          .post(this.config.magentoUrl, {
            variables: {
              filters: this.getFilters(),
              pageSize: 1,
              currentPage: 1,
            },
            query: getProducts,
          })
          .then((result) => {
            console.log({ result: result.data.data });

            const seriesOptions = result.data.data.products.aggregations
              .find((agg) => agg.attribute_code === "book_series")
              .options.sort((a, b) => {
                return a.label.localeCompare(b.label);
              });

            this.allOptions = seriesOptions;
            this.response.items = seriesOptions;
            this.loading = false;
          });
      }
    },
    addSelectedOption(option) {
      // Adds the clicked option to return from the linkplugin
      this.loading = true;

      if (this.findBy == "category") {
        this.selectProduct({
          id: option.uid,
          name: option.name,
          filterValue: {
            category_uid: {
              eq: option.uid,
            },
          },
          type: "dynamic-products",
        });
      }

      if (this.findBy == "brand") {
        this.selectProduct({
          id: option.value,
          name: option.label,
          filterValue: {
            office_brand: {
              eq: option.value,
            },
          },
          type: "dynamic-products",
        });
      }

      if (this.findBy == "author") {
        this.selectProduct({
          id: option.value,
          name: option.label,
          filterValue: {
            book_author: {
              eq: option.value,
            },
          },
          type: "dynamic-products",
        });
      }

      if (this.findBy == "series") {
        this.selectProduct({
          id: option.value,
          name: option.label,
          filterValue: {
            book_series: {
              eq: option.value,
            },
          },
          type: "dynamic-products",
        });
      }

      this.loading = false;
      this.close();
    },

    loadPage(page) {
      this.page = page;
      this.getOptions();
    },
  },
  components: {
    IntegrationItem,
    IntegrationPagination,
  },
};
</script>
