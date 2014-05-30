for l in en_US zh_TW; do
  mkdir -p ./po/${l}/LC_MESSAGES/
  msginit --input=./po/templates/LC_MESSAGES/messages.pot \
            --output-file=./po/${l}/LC_MESSAGES/messages.po \
            -l ${l}
done
