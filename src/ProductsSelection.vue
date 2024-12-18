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
            <option value="name">Name</option>
            <option value="sku">SKU (exact match)</option>
            <option value="ean">EAN (exact match)</option>
            <option value="author">Auteur</option>
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
          @click.prevent="selectItem(result)"
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
      findBy: "name",
      perPage: 21,
      page: 1,
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
    this.load();
  },
  methods: {
    debouncedSearch: debounce(function () {
      this.search();
    }, 300),
    search() {
      this.page = 1;
      this.load();
    },
    getFilters() {
      if (!this.searchTerm) return {};

      if (this.findBy == "name") {
        return {
          name: {
            match: this.searchTerm,
          },
        };
      } else if (this.findBy == "sku") {
        return {
          sku: {
            eq: this.searchTerm,
          },
        };
        //NOTE: Configured for Paagman
      } else if (this.findBy == "ean") {
        return {
          ean: {
            eq: this.searchTerm,
          },
        };
        //NOTE: Configured for Paagman
      } else if (this.findBy == "author") {
        return {
          book_author: {
            match: this.searchTerm,
          },
        };
      }
    },
    load() {
      this.loading = true;
      axios
        .post(this.config.magentoUrl, {
          variables: {
            filters: this.getFilters(),
            pageSize: this.perPage,
            currentPage: this.page,
          },
          query: `
          query GetProducts($filters: ProductAttributeFilterInput $pageSize: Int $currentPage: Int) {
            products(
              filter: $filters
              pageSize: $pageSize
              currentPage: $currentPage
            ) {
              total_count
              items {
                  uid
                  name
                  url_key
                  sku
                  small_image {
                    url
                  }
                  __typename
              }
            }
          }
          `,
        })
        .then((result) => {
          this.response = result.data.data.products;
          this.loading = false;
        });
    },
    selectItem(item) {
      if (this.config.productsLimit === "1") {
        this.selectProduct({
          id: item.uid,
          name: item.name,
          url: item.url_key,
          sku: item.sku,
          typename: item.__typename,
          type: "product",
        });
        this.close();
      } else {
        const alreadyInData = this.currentProducts.find(
          (product) => product.id === item.uid
        );

        if (alreadyInData) {
          const index = this.currentProducts.findIndex(
            (product) => product.id === item.uid
          );
          this.deleteItem(index);
          this.showLimitError = false;
          return;
        }

        if (
          this.currentProducts.length === parseInt(this.config.productsLimit)
        ) {
          this.showLimitError = true;
          return;
        } else {
          this.showLimitError = false;
        }
        this.selectProducts({
          id: item.uid,
          name: item.name,
          url: item.url_key,
          sku: item.sku,
          typename: item.__typename,
          type: "product",
        });
      }
    },
    loadPage(page) {
      this.page = page;
      this.load();
    },
  },
  components: {
    IntegrationItem,
    IntegrationPagination,
  },
};
</script>
