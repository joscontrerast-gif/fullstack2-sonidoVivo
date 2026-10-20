
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ],

  plugins: [
    [
      'istanbul',
      {
        include: ['src/services/**/*.js', 'src/modules/**/services/*.js'],
        exclude: ['**/*.spec.js', '**/*.spec.jsx']
      }
    ]
  ]
};
