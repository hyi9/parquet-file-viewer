<template>
  <div class="bg-white rounded-lg shadow-sm overflow-hidden">
    <!-- Header Controls -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex items-center gap-4">
          <h3 class="text-lg font-medium text-gray-900">Data Preview</h3>
          <div class="text-sm text-gray-500">
            Showing {{ startIndex + 1 }}-{{ Math.min(startIndex + pageSize, filteredData.length) }} 
            of {{ filteredData.length }} row{{ filteredData.length !== 1 ? 's' : '' }}
            {{ filteredData.length !== totalRows ? ` (filtered from ${totalRows})` : '' }}
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-2">
          <!-- Column Selection -->
          <div class="relative">
            <button
              @click="showColumnSelector = !showColumnSelector"
              class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 002 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10z"></path>
              </svg>
              Columns ({{ visibleColumns.length }})
            </button>
            
            <!-- Column Selector Dropdown -->
            <div v-if="showColumnSelector" 
                 class="absolute right-0 z-10 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
              <div class="p-3 border-b border-gray-200">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-900">Select Columns</span>
                  <button 
                    @click="showColumnSelector = false"
                    class="text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div class="flex gap-2 mb-3">
                  <button 
                    @click="selectAllColumns"
                    class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Select All
                  </button>
                  <button 
                    @click="deselectAllColumns"
                    class="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div class="max-h-60 overflow-y-auto p-3 space-y-2">
                <label 
                  v-for="column in columns" 
                  :key="column.name"
                  class="flex items-center space-x-2 cursor-pointer"
                >
                  <input 
                    type="checkbox" 
                    :checked="selectedColumns.includes(column.name)"
                    @change="toggleColumn(column.name)"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                  <span class="text-sm text-gray-900">{{ column.name }}</span>
                  <span class="text-xs text-gray-500">({{ column.type }})</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Page Size Selector -->
          <select 
            v-model="pageSize" 
            @change="currentPage = 1"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option :value="25">25 per page</option>
            <option :value="50">50 per page</option>
            <option :value="100">100 per page</option>
            <option :value="250">250 per page</option>
          </select>
        </div>
      </div>

      <!-- Filters -->
      <div v-if="visibleColumns.length > 0" class="mt-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-medium text-gray-900">Filters</h4>
          <button
            @click="addFilter"
            class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add Filter
          </button>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="filter in activeFilters" :key="filter.id" class="relative">
            <div class="flex items-center gap-2 mb-1">
              <select 
                v-model="filter.columnName"
                @change="applyFilters"
                class="text-xs font-medium text-gray-700 border-none bg-transparent p-0 focus:ring-0"
              >
                <option v-for="column in visibleColumns" :key="column.name" :value="column.name">
                  {{ column.name }}
                </option>
              </select>
              <button
                v-if="activeFilters.length > 1"
                @click="removeFilter(filter.id)"
                class="text-gray-400 hover:text-red-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="flex gap-1">
              <select 
                v-model="filter.type"
                @change="applyFilters"
                class="px-2 py-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 min-w-[120px]"
              >
                <option v-for="filterType in filterTypes" :key="filterType.value" :value="filterType.value">
                  {{ filterType.label }}
                </option>
              </select>
              <div class="relative flex-1 min-w-0">
                <input
                  :type="getInputType(filter.columnName)"
                  v-model="filter.value"
                  @input="applyFilters"
                  :placeholder="getPlaceholder(filter.type, filter.columnName)"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                <button
                  v-if="filter.value"
                  @click="clearFilter(filter.id)"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th 
              v-for="column in visibleColumns" 
              :key="column.name"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              @click="sortByColumn(column.name)"
            >
              <div class="flex items-center space-x-1">
                <span class="normal-case">{{ column.name }}</span>
                <span class="text-gray-400 normal-case font-normal">({{ column.type }})</span>
                <svg 
                  v-if="sortColumn === column.name" 
                  class="w-4 h-4"
                  :class="sortDirection === 'asc' ? 'transform rotate-180' : ''"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(row, rowIndex) in paginatedData" :key="rowIndex" class="hover:bg-gray-50">
            <td 
              v-for="column in visibleColumns" 
              :key="column.name"
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
            >
              <span v-if="row[column.name] === null" class="text-gray-400 italic">null</span>
              <span v-else-if="typeof row[column.name] === 'boolean'">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="row[column.name] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ row[column.name] ? 'true' : 'false' }}
                </span>
              </span>
              <span v-else-if="typeof row[column.name] === 'number'">
                {{ formatNumber(row[column.name]) }}
              </span>
              <span v-else class="max-w-xs truncate block" :title="row[column.name]">
                {{ row[column.name] }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="filteredData.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-4 text-sm font-medium text-gray-900">No data found</h3>
      <p class="mt-2 text-sm text-gray-500">
        {{ activeFilters.some(filter => filter.value) ? 'Try adjusting your filters' : 'No data to display' }}
      </p>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="px-6 py-3 border-t border-gray-200 bg-gray-50">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        <div class="flex space-x-2">
          <button
            @click="goToPage(1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            First
          </button>
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Previous
          </button>
          
          <!-- Page Numbers -->
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            class="px-3 py-2 text-sm border rounded-md"
            :class="page === currentPage 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'border-gray-300 hover:bg-gray-100'"
          >
            {{ page }}
          </button>
          
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Next
          </button>
          <button
            @click="goToPage(totalPages)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive, watch, onMounted } from 'vue';

export default {
  name: 'AdvancedDataTable',
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
  setup(props) {
    const currentPage = ref(1);
    const pageSize = ref(50);
    const selectedColumns = ref([]);
    const activeFilters = ref([]);
    const showColumnSelector = ref(false);
    const sortColumn = ref('');
    const sortDirection = ref('asc');
    const totalRows = ref(0);
    let nextFilterId = ref(1);

    // Filter types
    const filterTypes = [
      { value: 'contains', label: 'Contains' },
      { value: 'equals', label: 'Equals (=)' },
      { value: 'not_equals', label: 'Not equals (≠)' },
      { value: 'greater_than', label: 'Greater than (>)' },
      { value: 'greater_equal', label: 'Greater or equal (≥)' },
      { value: 'less_than', label: 'Less than (<)' },
      { value: 'less_equal', label: 'Less or equal (≤)' },
      { value: 'starts_with', label: 'Starts with' },
      { value: 'ends_with', label: 'Ends with' },
      { value: 'is_empty', label: 'Is empty' },
      { value: 'is_not_empty', label: 'Is not empty' }
    ];

    // Initialize
    onMounted(() => {
      selectedColumns.value = props.columns.map(col => col.name);
      totalRows.value = props.data.length;
      
      // Initialize with first column filter if columns exist
      if (props.columns.length > 0) {
        activeFilters.value = [{
          id: nextFilterId.value++,
          columnName: props.columns[0].name,
          type: 'contains',
          value: ''
        }];
      }
    });

    // Watch for data changes
    watch(() => props.data, (newData) => {
      totalRows.value = newData.length;
      currentPage.value = 1;
    });

    // Computed properties
    const visibleColumns = computed(() => {
      return props.columns.filter(col => selectedColumns.value.includes(col.name));
    });

    const filteredData = computed(() => {
      let filtered = [...props.data];

      // Apply active filters
      activeFilters.value.forEach(filter => {
        filtered = filtered.filter(row => {
          const cellValue = row[filter.columnName];
          return applyFilterCondition(cellValue, filter.type, filter.value);
        });
      });

      // Apply sorting
      if (sortColumn.value) {
        filtered.sort((a, b) => {
          const aVal = a[sortColumn.value];
          const bVal = b[sortColumn.value];
          
          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;
          
          let comparison = 0;
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            comparison = aVal - bVal;
          } else {
            comparison = String(aVal).localeCompare(String(bVal));
          }
          
          return sortDirection.value === 'asc' ? comparison : -comparison;
        });
      }

      return filtered;
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredData.value.length / pageSize.value);
    });

    const startIndex = computed(() => {
      return (currentPage.value - 1) * pageSize.value;
    });

    const paginatedData = computed(() => {
      const start = startIndex.value;
      const end = start + pageSize.value;
      return filteredData.value.slice(start, end);
    });

    const visiblePages = computed(() => {
      const current = currentPage.value;
      const total = totalPages.value;
      const delta = 2;
      
      let range = [];
      for (let i = Math.max(2, current - delta); 
           i <= Math.min(total - 1, current + delta); i++) {
        range.push(i);
      }
      
      if (current - delta > 2) {
        range.unshift('...');
      }
      if (current + delta < total - 1) {
        range.push('...');
      }
      
      range.unshift(1);
      if (total > 1) {
        range.push(total);
      }
      
      return range.filter((item, index, arr) => arr.indexOf(item) === index);
    });

    // Helper functions
    const applyFilterCondition = (cellValue, filterType, filterValue) => {
      // Handle empty/null values
      const isEmpty = cellValue === null || cellValue === undefined || cellValue === '';
      
      switch (filterType) {
        case 'is_empty':
          return isEmpty;
        case 'is_not_empty':
          return !isEmpty;
        default:
          // For other filters, empty values don't match
          if (isEmpty) return false;
          if (!filterValue || !filterValue.trim()) return true; // No filter value means show all
      }

      const cellStr = String(cellValue).toLowerCase();
      const filterStr = String(filterValue).toLowerCase().trim();
      
      // Try to parse as numbers for numeric comparisons
      const cellNum = parseFloat(cellValue);
      const filterNum = parseFloat(filterValue);
      const isNumeric = !isNaN(cellNum) && !isNaN(filterNum);
      
      switch (filterType) {
        case 'contains':
          return cellStr.includes(filterStr);
        case 'equals':
          return isNumeric ? cellNum === filterNum : cellStr === filterStr;
        case 'not_equals':
          return isNumeric ? cellNum !== filterNum : cellStr !== filterStr;
        case 'greater_than':
          return isNumeric ? cellNum > filterNum : cellStr > filterStr;
        case 'greater_equal':
          return isNumeric ? cellNum >= filterNum : cellStr >= filterStr;
        case 'less_than':
          return isNumeric ? cellNum < filterNum : cellStr < filterStr;
        case 'less_equal':
          return isNumeric ? cellNum <= filterNum : cellStr <= filterStr;
        case 'starts_with':
          return cellStr.startsWith(filterStr);
        case 'ends_with':
          return cellStr.endsWith(filterStr);
        default:
          return true;
      }
    };

    const getColumnType = (columnName) => {
      const column = props.columns.find(col => col.name === columnName);
      return column?.type.toLowerCase() || 'string';
    };

    const getInputType = (columnName) => {
      const colType = getColumnType(columnName);
      if (colType.includes('int') || colType.includes('float') || colType.includes('double') || colType.includes('decimal')) {
        return 'number';
      }
      if (colType.includes('date') || colType.includes('time')) {
        return 'date';
      }
      return 'text';
    };

    const getPlaceholder = (filterType, columnName) => {
      if (filterType === 'is_empty' || filterType === 'is_not_empty') {
        return 'No value needed';
      }
      
      const colType = getColumnType(columnName);
      const isNumeric = colType.includes('int') || colType.includes('float') || colType.includes('double') || colType.includes('decimal');
      
      switch (filterType) {
        case 'contains':
          return `Contains text in ${columnName}...`;
        case 'equals':
          return isNumeric ? `Enter number` : `Exact match for ${columnName}...`;
        case 'not_equals':
          return isNumeric ? `Enter number to exclude` : `Not equal to...`;
        case 'greater_than':
          return isNumeric ? `Enter number` : `Greater than...`;
        case 'greater_equal':
          return isNumeric ? `Enter number` : `Greater or equal to...`;
        case 'less_than':
          return isNumeric ? `Enter number` : `Less than...`;
        case 'less_equal':
          return isNumeric ? `Enter number` : `Less or equal to...`;
        case 'starts_with':
          return `Starts with...`;
        case 'ends_with':
          return `Ends with...`;
        default:
          return `Filter ${columnName}...`;
      }
    };

    // Methods
    const toggleColumn = (columnName) => {
      const index = selectedColumns.value.indexOf(columnName);
      if (index > -1) {
        selectedColumns.value.splice(index, 1);
      } else {
        selectedColumns.value.push(columnName);
      }
    };

    const selectAllColumns = () => {
      selectedColumns.value = props.columns.map(col => col.name);
    };

    const deselectAllColumns = () => {
      selectedColumns.value = [];
    };

    const applyFilters = () => {
      currentPage.value = 1;
    };

    const addFilter = () => {
      const availableColumns = visibleColumns.value.filter(col => 
        !activeFilters.value.some(filter => filter.columnName === col.name)
      );
      
      const columnToAdd = availableColumns.length > 0 
        ? availableColumns[0].name 
        : visibleColumns.value[0]?.name;
        
      if (columnToAdd) {
        activeFilters.value.push({
          id: nextFilterId.value++,
          columnName: columnToAdd,
          type: 'contains',
          value: ''
        });
      }
    };

    const removeFilter = (filterId) => {
      const index = activeFilters.value.findIndex(filter => filter.id === filterId);
      if (index > -1) {
        activeFilters.value.splice(index, 1);
      }
    };

    const clearFilter = (filterId) => {
      const filter = activeFilters.value.find(f => f.id === filterId);
      if (filter) {
        filter.value = '';
      }
      applyFilters();
    };

    const sortByColumn = (columnName) => {
      if (sortColumn.value === columnName) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn.value = columnName;
        sortDirection.value = 'asc';
      }
    };

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    const formatNumber = (value) => {
      if (Number.isInteger(value)) {
        return value.toLocaleString();
      }
      return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
    };

    return {
      currentPage,
      pageSize,
      selectedColumns,
      activeFilters,
      filterTypes,
      showColumnSelector,
      sortColumn,
      sortDirection,
      totalRows,
      visibleColumns,
      filteredData,
      totalPages,
      startIndex,
      paginatedData,
      visiblePages,
      toggleColumn,
      selectAllColumns,
      deselectAllColumns,
      applyFilters,
      addFilter,
      removeFilter,
      clearFilter,
      sortByColumn,
      goToPage,
      formatNumber,
      getInputType,
      getPlaceholder
    };
  }
};
</script>