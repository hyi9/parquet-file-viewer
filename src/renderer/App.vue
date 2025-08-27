<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <h1 class="text-2xl font-bold text-gray-900">Parquet File Viewer</h1>
          <div class="flex gap-2">
            <!-- Export Dropdown -->
            <div v-if="selectedFile && data && !loading && !error" class="relative">
              <button
                @click="showExportDropdown = !showExportDropdown"
                class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Export
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- Export Dropdown Menu -->
              <div v-if="showExportDropdown" 
                   class="absolute right-0 z-10 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                <div class="py-1">
                  <button
                    @click="exportData('csv')"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Export as CSV
                  </button>
                  <button
                    @click="exportData('tsv')"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Export as TSV
                  </button>
                  <button
                    @click="exportData('json')"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>
            
            <button
              v-if="selectedFile"
              @click="closeFile"
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Close File
            </button>
            <button
              @click="selectFile"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Select Parquet File
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="!selectedFile" class="text-center py-12">
        <div 
          @click="selectFile"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          @drop.prevent="handleDrop"
          :class="[
            'bg-white rounded-lg shadow-sm border-2 border-dashed p-12 cursor-pointer transition-all duration-200',
            isDragOver 
              ? 'border-blue-500 bg-blue-100 shadow-lg' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
          ]"
        >
          <svg class="mx-auto h-16 w-16 text-gray-400 transition-colors duration-200 hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          <h3 class="mt-6 text-xl font-medium text-gray-900">Drop your parquet file here</h3>
          <p class="mt-3 text-base text-gray-600">or <span class="text-blue-600 font-medium">click to browse</span> and select a file</p>
          <div class="mt-6">
            <div class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors duration-200">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Select Parquet File
            </div>
          </div>
          <div class="mt-4 text-xs text-gray-500">
            Supported format: .parquet
          </div>
        </div>
      </div>

      <div v-if="selectedFile" class="space-y-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">File Information</h2>
          <dl class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <dt class="text-sm font-medium text-gray-500">File Name</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ selectedFile.name }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">File Size</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatFileSize(selectedFile.size) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Status</dt>
              <dd class="mt-1">
                <span v-if="loading" class="text-sm text-yellow-600">Loading...</span>
                <span v-else-if="error" class="text-sm text-red-600">Error</span>
                <span v-else class="text-sm text-green-600">Ready</span>
              </dd>
            </div>
          </dl>
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error loading file</h3>
              <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div v-if="data && !loading && !error" class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex">
              <button
                @click="activeTab = 'data'"
                :class="[
                  'py-4 px-6 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'data' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                Data
              </button>
              <button
                @click="activeTab = 'schema'"
                :class="[
                  'py-4 px-6 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'schema' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                Schema
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            <AdvancedDataTable 
              v-if="activeTab === 'data'" 
              :data="data" 
              :columns="columns"
            />
            
            <div v-if="activeTab === 'schema'" class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Schema Information</h3>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Column Name
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data Type
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="column in columns" :key="column.name" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {{ column.name }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {{ column.type }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import AdvancedDataTable from './components/AdvancedDataTable.vue';
import { initializeDuckDB, queryParquetFile } from './utils/duckdb';

export default {
  name: 'App',
  components: {
    AdvancedDataTable
  },
  setup() {
    const selectedFile = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const data = ref(null);
    const columns = ref([]);
    const activeTab = ref('data');
    const showExportDropdown = ref(false);
    const isDragOver = ref(false);

    const selectFile = async () => {
      try {
        if (!window.electronAPI) {
          throw new Error('Electron API not available. Make sure the app is running in Electron.');
        }
        const file = await window.electronAPI.selectParquetFile();
        if (file) {
          selectedFile.value = file;
          await loadParquetData(file);
        }
      } catch (err) {
        console.error('Error selecting file:', err);
        error.value = err.message;
      }
    };

    const loadParquetData = async (file) => {
      loading.value = true;
      error.value = null;
      
      try {
        const fileBuffer = await window.electronAPI.readFileBuffer(file.path);
        const result = await queryParquetFile(fileBuffer);
        
        data.value = result.rows;
        columns.value = result.columns;
      } catch (err) {
        console.error('Error loading parquet data:', err);
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const closeFile = () => {
      selectedFile.value = null;
      data.value = null;
      columns.value = [];
      error.value = null;
      loading.value = false;
      activeTab.value = 'data';
      showExportDropdown.value = false;
    };

    const exportData = (format) => {
      showExportDropdown.value = false;
      
      if (!data.value || !columns.value.length) {
        console.error('No data to export');
        return;
      }

      let content = '';
      let filename = '';
      let mimeType = '';
      const baseFilename = selectedFile.value?.name?.replace('.parquet', '') || 'parquet_data';

      switch (format) {
        case 'csv':
          content = convertToCSV(data.value, columns.value);
          filename = `${baseFilename}.csv`;
          mimeType = 'text/csv';
          break;
        case 'tsv':
          content = convertToTSV(data.value, columns.value);
          filename = `${baseFilename}.tsv`;
          mimeType = 'text/tab-separated-values';
          break;
        case 'json':
          content = convertToJSON(data.value);
          filename = `${baseFilename}.json`;
          mimeType = 'application/json';
          break;
        default:
          console.error('Unsupported export format:', format);
          return;
      }

      downloadFile(content, filename, mimeType);
    };

    const convertToCSV = (data, columns) => {
      const headers = columns.map(col => col.name);
      const csvHeaders = headers.map(header => `"${header}"`).join(',');
      
      const csvRows = data.map(row => {
        return headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '""';
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        }).join(',');
      });

      return [csvHeaders, ...csvRows].join('\n');
    };

    const convertToTSV = (data, columns) => {
      const headers = columns.map(col => col.name);
      const tsvHeaders = headers.join('\t');
      
      const tsvRows = data.map(row => {
        return headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          return String(value).replace(/\t/g, ' ');
        }).join('\t');
      });

      return [tsvHeaders, ...tsvRows].join('\n');
    };

    const convertToJSON = (data) => {
      return JSON.stringify(data, null, 2);
    };

    const downloadFile = (content, filename, mimeType) => {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    };

    const handleDragOver = (event) => {
      event.preventDefault();
      isDragOver.value = true;
    };

    const handleDragLeave = (event) => {
      // Only set to false if we're leaving the drop zone entirely
      if (!event.currentTarget.contains(event.relatedTarget)) {
        isDragOver.value = false;
      }
    };

    const handleDrop = async (event) => {
      event.preventDefault();
      isDragOver.value = false;

      const files = Array.from(event.dataTransfer.files);
      
      if (files.length === 0) {
        return;
      }

      const file = files[0];
      
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.parquet')) {
        error.value = 'Please select a valid parquet file (.parquet extension required)';
        return;
      }

      // Create a file object similar to what Electron returns
      const fileInfo = {
        name: file.name,
        path: file.path || file.name, // Fallback for web
        size: file.size
      };

      selectedFile.value = fileInfo;
      
      try {
        // For drag and drop, we need to read the file differently
        const arrayBuffer = await file.arrayBuffer();
        const result = await queryParquetFile(arrayBuffer);
        
        data.value = result.rows;
        columns.value = result.columns;
        error.value = null;
      } catch (err) {
        console.error('Error loading dropped parquet file:', err);
        error.value = err.message;
        selectedFile.value = null;
      }
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    onMounted(async () => {
      try {
        await initializeDuckDB();
      } catch (err) {
        console.error('Error initializing DuckDB:', err);
        error.value = 'Failed to initialize database engine';
      }
    });

    return {
      selectedFile,
      loading,
      error,
      data,
      columns,
      activeTab,
      showExportDropdown,
      isDragOver,
      selectFile,
      closeFile,
      exportData,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      formatFileSize
    };
  }
};
</script>