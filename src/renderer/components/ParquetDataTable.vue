<template>
  <div class="bg-white rounded-lg shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900">Data Preview</h3>
      <p class="mt-1 text-sm text-gray-500">
        Showing {{ data.length }} row{{ data.length !== 1 ? 's' : '' }}
      </p>
    </div>
    
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.name"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ column.name }}
              <span class="text-gray-400 normal-case">({{ column.type }})</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(row, rowIndex) in data" :key="rowIndex" class="hover:bg-gray-50">
            <td 
              v-for="column in columns" 
              :key="column.name"
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
            >
              <span v-if="row[column.name] === null" class="text-gray-400 italic">null</span>
              <span v-else-if="typeof row[column.name] === 'boolean'">
                {{ row[column.name] ? 'true' : 'false' }}
              </span>
              <span v-else-if="typeof row[column.name] === 'number'">
                {{ formatNumber(row[column.name]) }}
              </span>
              <span v-else>{{ row[column.name] }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="data.length === 0" class="text-center py-12">
      <p class="text-sm text-gray-500">No data to display</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ParquetDataTable',
  props: {
    data: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    }
  },
  methods: {
    formatNumber(value) {
      if (Number.isInteger(value)) {
        return value.toLocaleString();
      }
      return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
    }
  }
};
</script>