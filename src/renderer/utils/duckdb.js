import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

let db = null;
let conn = null;

export async function initializeDuckDB() {
  if (db) return;

  try {
    const MANUAL_BUNDLES = {
      mvp: {
        mainModule: duckdb_wasm,
        mainWorker: mvp_worker,
      },
      eh: {
        mainModule: duckdb_wasm_eh,
        mainWorker: eh_worker,
      },
    };
    
    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
    const worker = new Worker(bundle.mainWorker);
    const logger = new duckdb.ConsoleLogger();
    
    db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    
    conn = await db.connect();
    
    console.log('DuckDB initialized successfully');
  } catch (error) {
    console.error('Failed to initialize DuckDB:', error);
    throw error;
  }
}

export async function queryParquetFile(fileBuffer, query = 'SELECT * FROM parquet_file') {
  if (!conn) {
    throw new Error('DuckDB not initialized');
  }

  try {
    // Register the parquet file buffer with DuckDB
    await db.registerFileBuffer('parquet_file.parquet', new Uint8Array(fileBuffer));
    
    // Query the parquet file directly using the filename - load ALL data
    const result = await conn.query(`SELECT * FROM 'parquet_file.parquet'`);
    
    console.log('DuckDB query result:', result);
    console.log('Result schema:', result.schema);
    console.log('Result numRows:', result.numRows);
    
    const columns = result.schema.fields.map(field => ({
      name: field.name,
      type: field.type.toString()
    }));
    
    // Convert Arrow result to JavaScript objects
    const rows = [];
    const arrowTable = result.toArray();
    
    for (let i = 0; i < arrowTable.length; i++) {
      const row = {};
      const arrowRow = arrowTable[i];
      
      columns.forEach((col) => {
        row[col.name] = arrowRow[col.name];
      });
      rows.push(row);
    }
    
    console.log('Processed rows:', rows.slice(0, 3)); // Log first 3 rows
    
    return {
      columns,
      rows,
      rowCount: rows.length
    };
  } catch (error) {
    console.error('Error querying parquet file:', error);
    throw error;
  }
}

export async function getTableInfo() {
  if (!conn) {
    throw new Error('DuckDB not initialized');
  }

  try {
    const result = await conn.query("DESCRIBE parquet_file");
    return result.toArray();
  } catch (error) {
    console.error('Error getting table info:', error);
    throw error;
  }
}