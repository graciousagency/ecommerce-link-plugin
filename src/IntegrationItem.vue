<template>
  <div
    class="integration-item"
    v-bind:class="{
      'integration-item--selected': selected,
      'integration-item--in-data': inData,
    }"
  >
    <div class="integration-item__left" v-if="item.small_image">
      <img :src="item.small_image.url" class="integration-item__image" />
    </div>
    <div class="integration-item__right">
      <div class="uk-form-text-label">{{ item.name }}</div>
      <div
        :class="{
          ['uk-form-text-label']: item && item.type === 'link',
          ['uk-text-muted']: item && item.type !== 'link',
        }"
        v-if="item.url"
      >
        {{ item.url }}
      </div>
      <table>
        <tr class="uk-text-muted" v-if="item.product_count">
          <td class="integration-table__title">Products:</td>
          <td class="integration-table__value">{{ item.product_count }}</td>
        </tr>
        <tr class="uk-text-muted" v-if="item.url_key">
          <td class="integration-table__title">URL:</td>
          <td class="integration-table__value">{{ item.url_key }}</td>
        </tr>
        <tr class="uk-text-muted" v-if="item.__typename">
          <td class="integration-table__title">Type:</td>
          <td class="integration-table__value">{{ item.__typename }}</td>
        </tr>
        <tr class="uk-text-muted" v-if="item.total_count">
          <td class="integration-table__title">Total count:</td>
          <td class="integration-table__value">{{ item.total_count }}</td>
        </tr>
        <tr class="uk-text-muted" v-if="item.full_slug">
          <td class="integration-table__title">Full slug:</td>
          <td class="integration-table__value">{{ item.full_slug }}</td>
        </tr>
      </table>
      <div
        class="uk-text-muted"
        v-if="[true, false].includes(item.openInNewTab)"
      >
        {{ item.openNewTab ? "Opens in new tab" : "Opens in same tab" }}
      </div>
    </div>

    <a
      href="#"
      @click.prevent="deleteItem(index)"
      class="action-buttons"
      v-if="inData"
    >
      <svg
        role="presentation"
        viewBox="0 0 24 24"
        class="sb-icon sb-icon--x-large"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M11 6C11 5.44772 11.4477 5 12 5C12.5523 5 13 5.44772 13 6H11ZM9 6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6H16H18H19C19.5523 6 20 6.44772 20 7C20 7.55228 19.5523 8 19 8H18V17C18 18.6569 16.6569 20 15 20H9C7.34315 20 6 18.6569 6 17V8H5C4.44772 8 4 7.55228 4 7C4 6.44772 4.44772 6 5 6H6H8H9ZM8 17V8H16V17C16 17.5523 15.5523 18 15 18H9C8.44772 18 8 17.5523 8 17ZM10 11H11.5V15H10V11ZM14 11H12.5V15H14V11Z"
          fill="currentColor"
        />
      </svg>
    </a>
  </div>
</template>

<script>
export default {
  props: {
    inData: Boolean,
    index: Number,
    current: Object,
    deleteItem: Function,
    currentItems: Array,
    item: Object,
  },
  computed: {
    selected() {
      if (this.currentItems && this.currentItems.length > 0) {
        return this.currentItems.find((item) => item.id === this.item.uid);
      }

      if (this.current) {
        if (this.current.type === "page") {
          return this.current.id === this.item.uuid;
        }

        return this.current.id === this.item.uid;
      }

      return false;
    },
  },
};
</script>

<style lang="scss">
.move-button {
  border-radius: 50%;
  border: 1px solid black;
  display: flex;
  align-items: center;
  width: 20px;
  height: 20px;

  &.up {
    transform: rotate(180deg);
  }
}

.action-buttons {
  cursor: pointer;
  position: absolute;
  right: 5px;
  top: 5px;
  width: 20px;
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

.integration-table__title {
  font-size: 11px;
  font-weight: 800;
  line-height: 14px;
  width: 30%;
}

.integration-table__value {
  font-size: 11px;
  line-height: 14px;
}
</style>
