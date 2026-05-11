<template>
  <span>
    <template v-for="(item, index) in getDictData" :key="index">
      <el-tag
        :type="getType(item.listClass)"
        :disable-transitions="true"
      >
        {{ item.dictLabel }}
      </el-tag>
    </template>
    <span v-if="getDictData.length == 0 && showValue">{{ showValue }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';

interface Props {
  dType?: string;
  values?: string | number | (string | number)[];
  showValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
  dType: '',
  values: '',
  showValue: '',
});

const dictData = ref<any[]>([]);

const getType = (listClass?: string): '' | 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  const typeMap: Record<string, any> = {
    primary: 'primary',
    success: 'success',
    danger: 'danger',
    warning: 'warning',
    info: 'info',
  };
  return typeMap[listClass || 'default'] || '';
};

const getDictData = computed(() => {
  if (!props.values) return [];
  const values = Array.isArray(props.values) ? props.values : [props.values];
  return dictData.value.filter((item) => values.includes(item.dictValue));
});

onMounted(async () => {
  const msgBus = (window as any).__QIANKUN_MSG_BUS__;
  if (msgBus?.useDict) {
    const data = await msgBus.useDict(props.dType);
    dictData.value = data || [];
  }
});
</script>
