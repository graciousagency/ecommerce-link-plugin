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
      <div class="uk-position-relative uk-text-nowrap">
        <div slot="actions">
          <a class="uk-button" @click.prevent="close">
            <i class="uk-icon-close"></i> Close
          </a>
        </div>
      </div>
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
          <IntegrationItem :item="result" :current="current" />
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
import debounce from "debounce";
import IntegrationItem from "./IntegrationItem";
import IntegrationPagination from "./IntegrationPagination";
export default {
  props: {
    config: Object,
    current: Object,
    api: Object,
    select: Function,
    close: Function,
  },
  data() {
    return {
      searchTerm: "",
      perPage: 21,
      page: 1,
      response: {
        total_count: 0,
        items: [],
      },
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
    load() {
      this.loading = true;
      const url = `cdn/stories?per_page=100${
        this.config.contentTypes
          ? `&filter_query[component][in]=` + this.config.contentTypes
          : ""
      }&sort_by=name:asc${
        this.searchTerm ? `&search_term=` + this.searchTerm : ""
      }`;

      this.api.get(url).then((res) => {
        this.response.items = res.data.stories;
        this.response.total_count = res.data.stories.length;
        this.loading = false;
      });
    },
    selectItem(item) {
      this.select({
        id: item.uuid,
        name: item.name,
        url: item.full_slug,
        type: "page",
      });
      this.close();
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
