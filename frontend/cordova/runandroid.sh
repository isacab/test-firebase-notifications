#!/bin/bash
# My first script

cd ..

ENV=${1:-azurecordova}

ng build --target=production --aot=false --environment=${ENV} --output-path cordova/www/ --base-href .

cd cordova

cordova run android