<template>
  <div class="pagination-container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 30, 50]"
      :small="small"
      :disabled="disabled"
      :background="background"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  total?: number;
  page?: number;
  limit?: number;
  small?: boolean;
  hidden?: boolean;
  background?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  total: 0,
  page: 1,
  limit: 10,
  small: false,
  hidden: false,
  background: true,
  disabled: false,
});

const emit = defineEmits<{
  (e: 'update:page', value: number): void;
  (e: 'update:limit', value: number): void;
  (e: 'pagination', payload: { page: number; limit: number }): void;
}>();

const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val),
});

const pageSize = computed({
  get: () => props.limit,
  set: (val) => emit('update:limit', val),
});

function handleSizeChange(val: number) {
  if (props.page * val > props.total) {
    currentPage.value = 1;
  }
  emit('pagination', { page: currentPage.value, limit: val });
}

function handleCurrentChange(val: number) {
  emit('pagination', { page: val, limit: pageSize.value });
}
</script>

<style lang="scss" scoped>
.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}
</style>
