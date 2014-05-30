for l in en_US zh_TW; do
  mkdir -p ${l}/LC_MESSAGES/
  msginit --input=./templates/LC_MESSAGES/messages.pot \
            --output-file=./${l}/LC_MESSAGES/messages.po \
            -l ${l}
done
