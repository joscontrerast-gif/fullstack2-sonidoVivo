
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ],

  plugins: [
    [
      'istanbul',
      {
        include: [
          'src/services/**/*.js',
          'src/data/**/*.js',
          'src/modules/**/*.{js,jsx}'
        ],
        exclude: ['**/*.spec.js', '**/*.spec.jsx', 'src/tests/**'],
        include: ['src/services/**/*.js', 'src/modules/**/services/*.js'],
        exclude: ['**/*.spec.js', '**/*.spec.jsx']
      }
    ]
  ]
};
