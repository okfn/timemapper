find locale -name "*.js" | xargs rm
find locale -name "*.json" | xargs rm
./node_modules/i18n-abide/bin/compile-json po locale
