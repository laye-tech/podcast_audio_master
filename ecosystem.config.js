module.exports = {
  apps: [
    {
      name: 'PODCASTBYLAYETECH',
      script: 'dist/main.js',
      node_args: '--max_old_space_size=16384',
      watch: false,
      max_memory_restart: '16G',
      exec_mode: 'cluster',
      instances: 'max',
      autorestart: true,
      restart_delay: 5000,
      combine_logs: true,
      // merge_logs: true,
      //log_file: 'C:\Users\LogsCentralisePodcast\',
      out_file: 'C:\Users\LogsCentralisePodcast\podcast-out.log',
      error_file: 'C:\Users\LogsCentralisePodcast\podcast-err.log',
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
};
