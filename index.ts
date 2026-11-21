import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  require('./src/compiled.css');
  require('@zakisheriff/liquid-glass/styles.css');
  require('./index.web');
} else {
  require('./index.native');
}

