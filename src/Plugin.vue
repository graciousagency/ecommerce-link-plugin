<template>
  <div class="integration" :style="cssVars">
    <div v-if="!modalIsOpen">
      <div class="uk-margin-small-bottom" v-if="model.item">
        {{ model.item.type }}:
      </div>
      <IntegrationItem
        v-if="model.item && model.items.length === 0"
        :item="model.item"
        :inData="true"
        :deleteItem="deleteItem"
      />
      <div v-if="model.items.length > 0">Products:</div>
      <draggable
        v-model="model.items"
        group="items"
        @start="drag = false"
        @end="drag = false"
      >
        <div
          v-for="(result, index) in model.items"
          :key="result.id"
          class="draggable-item"
        >
          <div
            href="#"
            class="uk-margin-small-top sortable-block-item--can-add-block sortable-item"
          >
            <IntegrationItem
              :item="result"
              :inData="true"
              :index="index"
              :deleteItem="deleteItem"
            />
          </div>
        </div>
      </draggable>
      <div class="error" v-if="!config">
        Please configure the linkPlugin for your space by opening the
        repository.
      </div>
      <select
        class="form-control uk-width-1-1 uk-margin-small-top"
        v-model="selectionType"
      >
        <option value="" disabled>Select item type</option>
        xw
        <option v-if="isEnabledSelection('products')" value="products">
          Products (Manual)
        </option>
        <option
          v-if="isEnabledSelection('dynamic-products')"
          value="dynamic-products"
        >
          Products (Dynamic)
        </option>
        <option v-if="isEnabledSelection('categories')" value="categories">
          Categories
        </option>
        <option v-if="isEnabledSelection('pages')" value="pages">Pages</option>
        <option v-if="isEnabledSelection('link')" value="link">
          External link
        </option>
      </select>

      <div v-if="selectionType === 'link'">
        <input
          v-model="externalLinkText"
          @input="onLinkChange()"
          placeholder="https://www.example.com"
          class="uk-width-1-1 uk-margin-small-top"
        />

        <div class="uk-margin-top uk-margin-bottom">
          <input
            class="uk-margin-small-right"
            type="radio"
            @change="onTabTypeChange($event)"
            v-model="openTabType"
            value="newTab"
          /><span class="uk-margin-right"> new tab </span>
          <input
            class="uk-margin-small-right"
            type="radio"
            @change="onTabTypeChange($event)"
            v-model="openTabType"
            value="sameTab"
          />same tab
        </div>
      </div>

      <button
        v-if="selectionType !== 'link'"
        :disabled="!(selectionType && config)"
        class="uk-button uk-width-1-1 uk-margin-small-top"
        @click.prevent="openSelection"
      >
        Open Selection
      </button>
    </div>

    <div class="uk-form" v-if="modalIsOpen">
      <ProductsSelection
        v-if="selectionType === 'products'"
        :config="config"
        :selectProduct="selectItem"
        :selectProducts="selectItems"
        :currentProduct="model.item"
        :deleteItem="deleteItem"
        :currentProducts="model.items"
        :close="closeSelection"
      />
      <DynamicProductsSelection
        v-if="selectionType === 'dynamic-products'"
        :config="config"
        :selectProduct="selectItem"
        :selectProducts="selectItems"
        :currentProduct="model.item"
        :deleteItem="deleteItem"
        :currentProducts="model.items"
        :close="closeSelection"
      />
      <CategorySelection
        v-if="selectionType === 'categories'"
        :config="config"
        :select="selectItem"
        :current="model.item"
        :close="closeSelection"
      />
      <PagesSelection
        v-if="selectionType === 'pages'"
        :api="api"
        :config="config"
        :select="selectItem"
        :current="model.item"
        :close="closeSelection"
      />
    </div>
  </div>
</template>

<script>
import IntegrationItem from "./IntegrationItem";
import ProductsSelection from "./ProductsSelection";
import DynamicProductsSelection from "./DynamicProductsSelection";
import CategorySelection from "./CategorySelection";
import PagesSelection from "./PagesSelection";
import draggable from "vuedraggable";

export default {
  mixins: [window.Storyblok.plugin],
  data() {
    return {
      modalIsOpen: false,
      externalLinkText: "",
      openTabType: "newTab",
      selectionType: "",
      config: null,
    };
  },
  computed: {
    cssVars() {
      return {
        "--primary-color": this.config ? this.config.primaryColor : "#00b3b0",
      };
    },
  },
  methods: {
    initWith() {
      return {
        plugin: "ecommerce-link-plugin",
        item: null,
        items: [],
      };
    },
    pluginCreated() {
      let configWithOptions = null;
      switch (this.spaceId) {
        // Paagman
        case 186555:
          configWithOptions = {
            magentoUrl: "https://acc-admin.paagman.nl/graphql",
            productsLimit: "1",
            contentTypes: "page",
            selectionOptions:
              "products, dynamic-products, categories, pages, link",
            primaryColor: "#E00076",
          };
          break;
        // Tafelzeilonline
        case 171815:
          configWithOptions = {
            magentoUrl: "https://test-admin.tafelzeilonline.com/graphql",
            productsLimit: "1",
            contentTypes: "page",
            selectionOptions: "products, categories, pages, link",
            primaryColor: "#ef8177",
          };
          break;
        // Banden XL
        case 302138:
          configWithOptions = {
            magentoUrl: "https://test-admin.bandenxl.nl/graphql",
            productsLimit: "1",
            contentTypes: "page",
            selectionOptions: "products, categories, pages, link",
            primaryColor: "#F31616",
          };
          break;
        // Contimeta
        case 321522:
          configWithOptions = {
            magentoUrl: "https://staging-admin.contimeta.com/graphql",
            productsLimit: "1",
            contentTypes: "page",
            selectionOptions: "products, categories, pages, link",
            primaryColor: "#2478FF",
          };
          break;
        default:
          break;
      }

      if (configWithOptions) {
        configWithOptions = Object.assign({}, configWithOptions, this.options);
        const optionsArr = configWithOptions.selectionOptions.split(",");

        if (optionsArr.length === 1) {
          this.selectionType = optionsArr[0];
        }

        this.config = configWithOptions;
      }

      console.info("Your spaceId is:", this.spaceId);
      console.info("Current plugin config:", this.config);
    },
    isEnabledSelection(selection) {
      if (!this.config) return false;

      return this.config.selectionOptions.includes(selection);
    },
    openSelection() {
      this.modalIsOpen = true;
      this.$emit("toggle-modal", true);
    },
    closeSelection() {
      this.modalIsOpen = false;
      this.$emit("toggle-modal", false);
    },
    onLinkChange() {
      this.selectItem({
        url: this.externalLinkText,
        openInNewTab: this.openTabType === "newTab",
        type: "link",
      });
    },
    onTabTypeChange(event) {
      const value = event.target.value;
      this.selectItem({
        url: this.externalLinkText,
        openInNewTab: value === "newTab",
        type: "link",
      });
    },
    deleteItem(index) {
      if (index !== undefined) {
        this.model.items.splice(index, 1);
        return;
      }

      this.model.item = null;
    },
    selectItem(item) {
      this.model.item = item;
      this.model.items = [];
    },
    selectItems(item) {
      this.model.items = [...this.model.items, Object.assign({}, item)];
      this.model.item = null;
    },
  },
  components: {
    IntegrationItem,
    ProductsSelection,
    DynamicProductsSelection,
    CategorySelection,
    PagesSelection,
    draggable,
  },
  watch: {
    model: {
      handler(value) {
        this.$emit("changed-model", value);
      },
      deep: true,
    },
  },
};
</script>

<style lang="scss">
.error {
  color: red;
}
.integration-item {
  border: 1px solid #ddd;
  padding: 10px;
  position: relative;
  background: #fff;
  display: flex;
  justify-content: space-between;

  &.integration-item--selected {
    border-color: var(--primary-color);
    outline: 0;
    background: #f8f8f8;
    color: #444;
  }

  &.integration-item--in-data {
    border-left: 5px solid var(--primary-color);
    padding-right: 30px;
  }
}
.draggable-item {
  > div {
    cursor: move;
    cursor: -moz-grab;
    cursor: -webkit-grab;
  }

  &.sortable-chosen {
    > div {
      cursor: grabbing;
      cursor: -moz-grabbing;
      cursor: -webkit-grabbing;
    }
  }
}

.integration-item__left {
  width: 60px;
  height: 60px;
  min-height: 60px;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid #ddd;
  background: #eee;
}
.integration-item__image {
  display: block;
  height: 60px;
  max-width: 60px;
  max-height: 60px;
  margin: 0 auto;
}
.integration-item__right {
  flex-grow: 1;
  padding-left: 10px;
  word-wrap: break-word;
}
.integration-selection {
  min-height: 700px;
}

.integration-selection .uk-pagination > .uk-active > span {
  background-color: var(--primary-color);
}
.spinner {
  width: 50px;
  height: 50px;
  background-color: var(--primary-color);
  margin: 100px auto;
  -webkit-animation: sk-rotateplane 1.2s infinite ease-in-out;
  animation: sk-rotateplane 1.2s infinite ease-in-out;
}
@-webkit-keyframes sk-rotateplane {
  0% {
    -webkit-transform: perspective(120px);
  }
  50% {
    -webkit-transform: perspective(120px) rotateY(180deg);
  }
  100% {
    -webkit-transform: perspective(120px) rotateY(180deg) rotateX(180deg);
  }
}
@keyframes sk-rotateplane {
  0% {
    transform: perspective(120px) rotateX(0deg) rotateY(0deg);
    -webkit-transform: perspective(120px) rotateX(0deg) rotateY(0deg);
  }
  50% {
    transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
    -webkit-transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
  }
  100% {
    transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
    -webkit-transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
  }
}
.integration-selection__header {
  position: sticky;
  top: 0px;
  background: #ffffff;
  padding-bottom: 10px;
}
.integration-results {
  height: 100%;
}
</style>
