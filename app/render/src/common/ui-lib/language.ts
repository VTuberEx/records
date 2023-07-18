import { addLocale, locale } from 'primereact/api';
import data from './zh-CN.json';

// wget https://github.com/primefaces/primelocale/raw/main/zh-CN.json

addLocale('zh-CN', data['zh-CN']);
locale('zh-CN');
