import { AppRegistry } from 'react-native';
import App from './src/App';
import AppClass from './src/AppClass';
import AppHostList from './src/AppHostList';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => AppClass);
