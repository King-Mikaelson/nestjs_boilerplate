import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  username: 'user_organization_hng_task_user',
  password: 'kq213c6ZEE9Ej3K3o6ciULulmiIVBs9r',
  host: 'dpg-cq42pt2ju9rs739o0t60-a.oregon-postgres.render.com',
  database: 'user_organization_hng_task',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/src/database/migrations/*.js'],
  ssl: {
    rejectUnauthorized: false,
  },
  logging: true,
  synchronize: true,
};

const dataSource = new DataSource(dataSourceOptions);

// export const initializeDataSource = async () => {
//   try {
//     await dataSource.initialize();
//     console.log('Data Source has been initialized!');

//     const entityMetadata = dataSource.entityMetadatas;
//     entityMetadata.forEach(entity => {
//       console.log(`Entity: ${entity.name}`);
//       console.log(`Table: ${entity.tableName}`);
//     });

//     return dataSource;
//   } catch (err) {
//     console.error('Error during Data Source initialization', err);
//     throw err;
//   }
// };

export default dataSource;
