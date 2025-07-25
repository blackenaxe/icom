﻿import { AppRegistry } from 'react-native';
import App from './App';
import appJson from './app.json';
const appName = appJson.name;

AppRegistry.registerComponent(appName, () => App);

if (typeof document !== 'undefined') {
  AppRegistry.runApplication(appName, {
    rootTag: document.getElementById('root'),
  });
}
